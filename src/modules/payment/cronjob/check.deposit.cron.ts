import { Inject, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WaiterDeposit } from './check.deposit.schema';
import { TransactionService } from '../transaction/transaction.service';
import { PaymentService } from '../payment.service';
import { WalletService } from '../walllet/wallet.service';

@Injectable()
export class CronDepositService {
    constructor(
        @InjectModel(WaiterDeposit.name) private waiterModel: Model<WaiterDeposit>,
        @Inject('PAYMENT_SERVICE_TIENNT') private paymentService: PaymentService,
        @Inject('WALLET_SERVICE_TIENNT') private walletService: WalletService,
        @Inject('TRANSACTION_SERVICE_TIENNT') private transactionService: TransactionService,
    ) { }

    async create(payload: WaiterDeposit): Promise<WaiterDeposit> {
        const createdFile = new this.waiterModel(payload);
        return createdFile.save();
    }

    async findAll(): Promise<WaiterDeposit[]> {
        return this.waiterModel.find().exec();
    }

    async deleteWaiter(id: string): Promise<any> {
        return this.waiterModel.deleteOne({ id_payment: id }).exec();
    }

    @Interval(30 * 1000)
    async handleIntervalTask() {
        try {
            // get all waiter
            var waiters = await this.findAll();
            console.log('Waiter Deposit: ', waiters);
            if (waiters.length > 0) {
                waiters.forEach(async waiter => {
                    var result = await this.paymentService.checkIdOrder(waiter.id_payment);
                    var transaction = await this.transactionService.getOne(waiter.id_transaction);
                    if (result.code == '00' && result?.data?.status == 'PAID') {
                        await this.deleteWaiter(waiter.id_payment);
                        var wallet = await this.walletService.getOne(transaction.wallet_id);
                        await this.walletService.increaseBalance(transaction.wallet_id, parseInt(transaction.amount.toString()) + parseInt(wallet.balance.toString()));
                    } else if (result?.data?.status == 'EXPIRED' || result?.data?.status == 'CANCELLED') {
                        await this.transactionService.delete(transaction.id);
                        await this.deleteWaiter(waiter.id_payment);
                    }
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

}