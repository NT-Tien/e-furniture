import { HttpException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/base.service";
import { OrderEntity, statusDelivery } from "src/entities/order.entity";
import { Repository } from "typeorm";
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import { OptionProductService } from "../product/option.product/option.product.service";
import { InjectModel } from "@nestjs/mongoose";
import { Waiter } from "./cronjob/check.order.schema";
import { Model } from "mongoose";
import { isUUID } from "class-validator";
import { VoucherService } from "../voucher/voucher.service";
import { WalletService } from "./walllet/wallet.service";

dotenv.config();

type payloadType = {
    orderCode: number,
    amount: number,
    description: string,
    buyerName: string,
    buyerEmail: string,
    buyerPhone: string,
    items: any // array of option product
}
@Injectable()
export class PaymentService extends BaseService<OrderEntity> {

    returnURL = 'https://e-furniture-swd.vercel.app';
    cancelURL = 'https://e-furniture-swd.vercel.app';

    constructor(
        @InjectRepository(OrderEntity) private readonly orderRepository: Repository<OrderEntity>,
        // check option product before order and payment
        @Inject('OPTION_PRODUCT_SERVICE_TIENNT') private readonly optionProductService: OptionProductService,
        // create waiter
        @InjectModel(Waiter.name) private waiterModel: Model<Waiter>,
        // voucher service
        @Inject('VOUCHER_SERVICE') private readonly voucherService: VoucherService,
        @Inject('WALLET_SERVICE_TIENNT') private readonly walletService: WalletService,
    ) {
        super(orderRepository);
    }

    async generateHmac(payload: payloadType) {
        var data = `amount=${payload.amount}&cancelUrl=${this.cancelURL}&description=${payload.description}&orderCode=${payload.orderCode}&returnUrl=${this.returnURL}`
        const checksum = process.env.PAYOS_CHECKSUM_KEY;
        const hmac = crypto.createHmac('sha256', checksum);
        hmac.update(data);
        return hmac.digest('hex');
    }
    // check order info and return link payment
    async createLinkPayment(order: OrderEntity): Promise<any> {
        for (let i = 0; i < order.products.length; i++) {
            const product = order.products[i];
            // check product is exist and enough quantity and correct price
            await this.optionProductService.checkProductIsExistAndEnoughQuantityAndPrice(product.id, product.quantity, product.price, product.name);
        }
        // check total price of order
        var total = 0;
        for (let i = 0; i < order.products.length; i++) {
            const product = order.products[i];
            total += product.price * product.quantity;
        }
        // discount if have voucher
        var voucher_id = order.voucher_id;
        if (voucher_id) {
            var voucher = await this.voucherService.checkVoucherIsExistAndNotExpired(voucher_id);
            total = await this.voucherService.discountVoucher(voucher, total);
        }
        if (total.toFixed(0) != order.total.toFixed(0)) {
            throw new HttpException('Total price is not correct', 400);
        }
        var orderCreated = await this.create(order);
        await this.TakeOutQuantity(order);
        // setup payload
        var payload: payloadType = {
            orderCode: Date.now(),
            amount: order.total,
            description: order.phone,
            buyerName: "NGUYEN TRONG TIEN",
            buyerEmail: "test.dev@gmail.com",
            buyerPhone: "0123456789",
            items: order.products
        }
        // generate hmac
        var hmac = await this.generateHmac(payload);
        return await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': process.env.PAYOS_CLIENT_ID,
                'x-api-key': process.env.PAYOS_API_KEY,
            },
            body: JSON.stringify({
                ...payload,
                "cancelUrl": this.cancelURL,
                "returnUrl": this.returnURL,
                "expiredAt": Math.floor(Date.now() / 1000) + (2 * 60), // 5 minutes
                "signature": hmac
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data?.data?.paymentLinkId) {
                    var waiter = {
                        id_payment: data.data.paymentLinkId,
                        id_order: orderCreated.id,
                        products: orderCreated.products,
                    }
                    this.waiterModel.create(waiter);
                    return data;
                } else {
                    return data
                }
            })
            .catch((error) => {
                throw new HttpException(error, 400);
            });
    }

    async payWithWallet(order: OrderEntity): Promise<any>{
        for (let i = 0; i < order.products.length; i++) {
            const product = order.products[i];
            // check product is exist and enough quantity and correct price
            await this.optionProductService.checkProductIsExistAndEnoughQuantityAndPrice(product.id, product.quantity, product.price, product.name);
        }
        // check total price of order
        var total = 0;
        for (let i = 0; i < order.products.length; i++) {
            const product = order.products[i];
            total += product.price * product.quantity;
        }
        // discount if have voucher
        var voucher_id = order.voucher_id;
        if (voucher_id) {
            var voucher = await this.voucherService.checkVoucherIsExistAndNotExpired(voucher_id);
            total = await this.voucherService.discountVoucher(voucher, total);
        }
        if (total != order.total) {
            throw new HttpException('Total price is not correct', 400);
        }
        if (!order.user_id) {
            throw new HttpException('User id is required', 400);
        }
        var wallet_payment = await this.walletService.checkWalletBalanceAndDecreaseBalance(order.user_id, total);
        console.log('wallet_payment', JSON.stringify(wallet_payment));
        order.status_delivery = statusDelivery.SHIPPING;
        order.wallet_payment = {
            wallet_id: wallet_payment.id,
            total: total,
        }
        var orderCreated = await this.create(order);
        await this.TakeOutQuantity(order);
        return {
            status: 'PAID',
            id: orderCreated.id
        }
    }
    // check status order  after 5 minutes
    async checkIdOrder(idOrder: string): Promise<any> {
        return fetch(`https://api-merchant.payos.vn/v2/payment-requests/${idOrder}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': process.env.PAYOS_CLIENT_ID,
                'x-api-key': process.env.PAYOS_API_KEY,
            },
        })
            .then(response => response.json())
            .then(data => {
                return data;
            })
            .catch((error) => {
                return JSON.stringify(error);
            });
    }

    // take out quantity of product after order
    async TakeOutQuantity(order: OrderEntity): Promise<any> {
        // decrease quantity of product after order
        for (let i = 0; i < order.products.length; i++) {
            const product = order.products[i];
            await this.optionProductService.decreaseQuantityOfProduct(product.id, product.quantity);
        }
    }

    // turn back product quantity after cancel order
    async cancelOrder(order: OrderEntity): Promise<any> {
        // increase quantity of product after cancel order
        for (let i = 0; i < order.products.length; i++) {
            const product = order.products[i];
            await this.optionProductService.increaseQuantityOfProduct(product.id, product.quantity);
        }
    }

    // get order by user id
    async getOrderByUser(userId: string): Promise<any> {
        // is uuid
        if (isUUID(userId)) {
            return await this.orderRepository.createQueryBuilder('order')
                .where('order.user_id = :user_id', { user_id: userId })
                .getMany();
        } else {
            throw new HttpException('User id is not valid', 400);
        }
    }

    // get most popular products order by purchase amount
    async getMostPopularProducts(): Promise<any> {
        var result = await this.orderRepository.createQueryBuilder('order')
            .select('order.products')
            .where('order.status_delivery = :status1 OR order.status_delivery = :status2', { status1: "SHIPPING", status2: "DELIVERED" })
            .getMany();

        var products = [];
        // get all products in all orders and calculate quantity of each product
        for (let i = 0; i < result.length; i++) {
            const order = result[i];
            for (let j = 0; j < order.products.length; j++) {
                const product = order.products[j];
                var index = products.findIndex(x => x.id == product.id);
                if (index == -1) {
                    products.push({
                        id: product.id,
                        name: product.name,
                        quantity: product.quantity
                    })
                } else {
                    products[index].quantity += product.quantity;
                }
            }
        }
        // sort products by quantity
        products.sort((a, b) => (a.quantity > b.quantity) ? -1 : 1);
        // get top 5 products
        products = products.slice(0, 5);
        return products;
    }

}

// {
//     "code": "00",
//     "desc": "success",
//     "data": {
//         "id": "ac7eef1937a041749078b793840dbd79",
//         "orderCode": 1704795585110,
//         "amount": 4000,
//         "amountPaid": 4000,
//         "amountRemaining": 0,
//         "status": "PAID",
//         "createdAt": "2024-01-09T17:19:45+07:00",
//         "transactions": [
//             {
//                 "reference": "FT24009614024000",
//                 "amount": 4000,
//                 "accountNumber": "0559330072",
//                 "description": "TTH5HVK5 ",
//                 "transactionDateTime": "2024-01-09T17:20:21+07:00",
//                 "virtualAccountName": "NGUYEN TRONG TIEN",
//                 "virtualAccountNumber": null,
//                 "counterAccountBankId": null,
//                 "counterAccountBankName": null,
//                 "counterAccountName": null,
//                 "counterAccountNumber": null
//             }
//         ],
//         "canceledAt": null,
//         "cancellationReason": null
//     },
//     "signature": "213612009149c8026469e5e9c7e3034f9303cc0100ae697cf77f6d7ed9521b27"
// }

// {
//     "code": "00",
//     "desc": "success",
//     "data": {
//         "id": "6d94681ba2a44f85860e28d7400ce66c",
//         "orderCode": 1704789866282,
//         "amount": 12000,
//         "amountPaid": 0,
//         "amountRemaining": 12000,
//         "status": "EXPIRED",
//         "createdAt": "2024-01-09T15:44:27+07:00",
//         "transactions": [],
//         "canceledAt": null,
//         "cancellationReason": null
//     },
//     "signature": "60b5cc7f0ae55cebff5c50d9d7d4dd73e29ca91db63bd282d989165fc229d3f9"
// }