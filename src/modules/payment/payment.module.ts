import { Module } from "@nestjs/common";
import { AccountModule } from "../account/account.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderEntity } from "src/entities/order.entity";
import { PaymentService } from "./payment.service";
import { WalletEnity } from "src/entities/wallet.entity";
import { TransactionEntity } from "src/entities/transaction.entity";
import { PaymentController } from "./payment.controller";
import { ProductModule } from "../product/product.module";
import { WalletService } from "./walllet/wallet.service";
import { TransactionService } from "./transaction/transaction.service";
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from "./cronjob/check.order.cron";
import { Waiter, WaiterSchema } from "./cronjob/check.order.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { WalletController } from "./walllet/wallet.controller";
import { WaiterDeposit, WaiterDepositSchema } from "./cronjob/check.deposit.schema";
import { CronDepositService } from "./cronjob/check.deposit.cron";
import { AuthModule } from "../auth/auth.module";
import { OrderGateway } from "./cronjob/order.gateway";
import { VoucherModule } from "../voucher/voucher.module";
import { TransactionController } from "./transaction/transaction.controller";

@Module({
    imports: [
        AuthModule,
        AccountModule,
        ProductModule,
        VoucherModule,
        TypeOrmModule.forFeature([OrderEntity]),
        TypeOrmModule.forFeature([WalletEnity]),
        TypeOrmModule.forFeature([TransactionEntity]),
        MongooseModule.forFeature([{ name: Waiter.name, schema: WaiterSchema }]),
        MongooseModule.forFeature([{ name: WaiterDeposit.name, schema: WaiterDepositSchema }]),
        ScheduleModule.forRoot(),
    ],
    controllers: [
        PaymentController,
        WalletController,
        TransactionController,
    ],
    providers: [
        OrderGateway,
        {
            provide: 'PAYMENT_SERVICE_TIENNT',
            useClass: PaymentService
        }, 
        {
            provide: 'WALLET_SERVICE_TIENNT',
            useClass: WalletService
        },
        {
            provide: 'TRANSACTION_SERVICE_TIENNT',
            useClass: TransactionService
        },
        { 
            provide: 'TASK_SERVICE_TIENNT',
            useClass: TasksService
        },
        {
            provide: 'WAITER_DEPOSIT_SERVICE_TIENNT',
            useClass: CronDepositService
        }
    ],
})
export class PaymentModule { }