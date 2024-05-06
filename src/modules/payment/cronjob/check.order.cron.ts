import { Inject, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Waiter } from './check.order.schema';
import { PaymentService } from '../payment.service';
import { OrderEntity, statusDelivery } from 'src/entities/order.entity';
import { sendMailForUserPaid } from './payment.email';
import { OrderGateway } from './order.gateway';

@Injectable()
export class TasksService {
    constructor(
        @InjectModel(Waiter.name) private waiterModel: Model<Waiter>,
        @Inject('PAYMENT_SERVICE_TIENNT') private paymentService: PaymentService,
        private orderGateway: OrderGateway
    ) { }

    async create(payload: Waiter): Promise<Waiter> {
        const createdFile = new this.waiterModel(payload);
        return createdFile.save();
    }

    async findAll(): Promise<Waiter[]> {
        return this.waiterModel.find().exec();
    }

    async deleteWaiter(id: string): Promise<any> {
        return this.waiterModel.deleteOne({ id_payment: id }).exec();
    }

    @Interval(30 * 1000) // Every 300 seconds
    async handleIntervalTask() {
        // get all waiter
        var waiters = await this.findAll();
        console.log('Waiter payment', waiters);
        if (waiters.length > 0) {
            waiters.forEach(async waiter => {
                var result = await this.paymentService.checkIdOrder(waiter.id_payment);
                var order = await this.paymentService.getOne(waiter.id_order);
                if (result.code == '00' && result?.data?.status == 'PAID') {
                    order.payment = result.data;
                    order.status_delivery = statusDelivery.SHIPPING;
                    await this.paymentService.update(order.id, OrderEntity.plainToClass(order));
                    await this.deleteWaiter(waiter.id_payment);
                    sendMailForUserPaid(order);
                    this.orderGateway.server.emit('message', { message: 'Have new orders' });
                } else if (result?.data?.status == 'EXPIRED' || result?.data?.status == 'CANCELLED') {
                    order.payment = result.data;
                    order.status_delivery = statusDelivery.CANCELED;
                    this.paymentService.cancelOrder(order);
                    await this.paymentService.update(order.id, OrderEntity.plainToClass(order));
                    await this.deleteWaiter(waiter.id_payment);
                }
            });
        }
    }

}