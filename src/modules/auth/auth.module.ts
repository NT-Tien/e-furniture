// auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from 'src/entities/account.entity';
import { AuthController } from './auth.controller';
import { AccountService } from '../account/account.service';
import { ProfileEntity } from 'src/entities/profile.entity';
import { ProfileService } from '../account/profile/profile.service';

dotenv.config();

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET_KEY,
            signOptions: { expiresIn: '2h', algorithm: 'HS256' },
        }),
        TypeOrmModule.forFeature([AccountEntity]),
        TypeOrmModule.forFeature([ProfileEntity]),
    ],
    controllers: [
        AuthController,
    ],
    providers: [
        {
            provide: 'AUTH_SERVICE_TIENNT',
            useClass: AuthService,
        },
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
            provide: 'AUTH_SERVICE_TIENNT',
            useClass: AuthService,
        }
    ],
})
export class AuthModule { }
