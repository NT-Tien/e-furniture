import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductEntity } from "src/entities/product.entity";
import { RateEntity } from "src/entities/rate.entity";
import { AuthModule } from "src/modules/auth/auth.module";
import { RateService } from "./rate.service";
import { RateController } from "./rate.controller";


@Module({
    imports: [
        TypeOrmModule.forFeature([RateEntity]),
        AuthModule,
    ],
    controllers: [
        RateController,
    ],
    providers: [
        {
            provide: 'RATE_SERVICE_TIENNT',
            useClass: RateService,
        }
    ],
})
export class RateModule { }