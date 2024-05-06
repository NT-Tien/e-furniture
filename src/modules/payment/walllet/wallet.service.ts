import { HttpException, Inject, Injectable, Req, Res } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/base.service";
import { WalletEnity } from "src/entities/wallet.entity";
import { Repository } from "typeorm";
import { TransactionService } from "../transaction/transaction.service";
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import { TransactionEntity, TransactionType } from "src/entities/transaction.entity";
import { InjectModel } from "@nestjs/mongoose";
import { WaiterDeposit } from "../cronjob/check.deposit.schema";
import { Model } from "mongoose";


dotenv.config();

type payloadType = {
    orderCode: number,
    amount: number,
    description: string,
    user_id: string,
}

@Injectable()
export class WalletService extends BaseService<WalletEnity> {

    returnURL = 'https://e-furniture-swd.vercel.app';
    cancelURL = 'https://e-furniture-swd.vercel.app';

    constructor(
        @InjectRepository(WalletEnity) private readonly walletRepository: Repository<WalletEnity>,
        @Inject('TRANSACTION_SERVICE_TIENNT') private readonly transactionService: TransactionService,
        @InjectModel(WaiterDeposit.name) private waiterDeposit: Model<WaiterDeposit>,
    ) {
        super(walletRepository);
    }

    // check wallet balance and decrease balance
    async checkWalletBalanceAndDecreaseBalance(user_id: string, amount: number): Promise<WalletEnity> {
        try {
            var wallet = await this.findWalletWithUserId(user_id);

            if (parseFloat(wallet.balance.toString()) < amount) {
                throw new HttpException('Balance is not enough', 400);
            } else {
                wallet.balance = wallet.balance - amount;
                return await this.update(wallet.id, wallet);
            }
        } catch (error) {
            throw new HttpException(error, 400);
        }
    }

    // find wallet with user id (account id)
    async findWalletWithUserId(user_id: string): Promise<WalletEnity> {
        try {
            return await this.walletRepository.findOne({ where: { user_id: user_id } });
        } catch (error) {
            throw new Error('Wallet not found');
        }
    }

    async increaseBalance(wallet_id: string, amount: number): Promise<WalletEnity> {
        try {
            var wallet = await this.walletRepository.findOne({ where: { id: wallet_id } });
            wallet.balance = parseFloat(wallet.balance.toString()) + amount;
            return await this.update(wallet_id, wallet);
        } catch (error) {
            console.log(error);
            throw new Error('Wallet not updated');
        }
    }

    async decreaseBalance(wallet_id: string, amount: number) {
        try {
            var wallet = await this.walletRepository.findOne({ where: { id: wallet_id } });
            if (wallet.balance < amount) {
                throw new Error('Balance is not enough');
            } else {
                wallet.balance = wallet.balance - amount;
                await this.walletRepository.update(wallet_id, wallet);
                return wallet;
            }
        } catch (error) {
            throw new Error('Wallet not updated');
        }
    }

    async generateHmac(payload: payloadType) {
        var data = `amount=${payload.amount}&cancelUrl=${this.cancelURL}&description=${payload.description}&orderCode=${payload.orderCode}&returnUrl=${this.returnURL}`
        const checksum = process.env.PAYOS_CHECKSUM_KEY;
        const hmac = crypto.createHmac('sha256', checksum);
        hmac.update(data);
        return hmac.digest('hex');
    }

    // create link payment to deposit for user
    async createLinkPaymentToDepositForUser(body: { user_id: string, amount: number }) {
        try {
            var payload = {
                orderCode: Date.now(),
                amount: body.amount,
                description: 'Nạp tiền vào ví',
            } as payloadType;
            var hmac = await this.generateHmac(payload);
            var wallet = await this.findWalletWithUserId(body.user_id);
            var transaction = {
                wallet_id: wallet.id,
                amount: payload.amount,
                type: 'deposit' as TransactionType,
                fee: 0,
            } as TransactionEntity;
            var transactionCreated = await this.transactionService.create(transaction);
            return fetch('https://api-merchant.payos.vn/v2/payment-requests', {
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
                    "expiredAt": Math.floor(Date.now() / 1000) + 300, // 5 minutes
                    "signature": hmac
                }),
            })
                .then(response => response.json())
                .then(data => {
                    var waiter = {
                        id_payment: data.data.paymentLinkId,
                        id_transaction: transactionCreated.id,
                        amount: payload.amount,
                    }
                    this.waiterDeposit.create(waiter);
                    return data;
                })
                .catch((error) => {
                    throw new HttpException(error, 400);
                });
        } catch (error: any) {
            console.log(error);

            throw new Error(error);
        }
    }
    // create request - withdraw for user ( store request in transaction table and wait for admin accept or reject) 
    // get list request - withdraw for user
    // update transaction table when admin accept or reject request
    // get list transaction for admin 

}