import { Module } from "@nestjs/common";
import { VoucherController } from "./voucher.controller";
import { VoucherService } from "./voucher.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VoucherEntity } from "src/entities/voucher.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([VoucherEntity]),
        AuthModule
    ],
    controllers: [VoucherController],
    providers: [
        {
            provide: 'VOUCHER_SERVICE',
            useClass: VoucherService
        }
    ],
    exports: [
        {
            provide: 'VOUCHER_SERVICE',
            useClass: VoucherService
        }
    ]
})
export class VoucherModule { }