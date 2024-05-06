import { Module } from "@nestjs/common";
import { AccountEntity } from "../../entities/account.entity";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProfileEntity } from "src/entities/profile.entity";
import { ProfileService } from "./profile/profile.service";
import { WalletEnity } from "src/entities/wallet.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([AccountEntity]),
        TypeOrmModule.forFeature([WalletEnity]),
        TypeOrmModule.forFeature([ProfileEntity]),
        AuthModule
    ],
    controllers: [AccountController],
    providers: [
        {
            provide: 'ACCOUNT_SERVICE_TIENNT',
            useClass: AccountService,
        },
        {
            provide: 'PROFILE_SERVICE_TIENNT',
            useClass: ProfileService,

        }
    ],
    exports: [
        {
            provide: 'ACCOUNT_SERVICE_TIENNT',
            useClass: AccountService,
        }
    ],
})
export class AccountModule { }