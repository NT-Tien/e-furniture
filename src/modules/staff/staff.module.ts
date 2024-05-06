import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderEntity } from "src/entities/order.entity";
import { AuthModule } from "../auth/auth.module";
import { StaffService } from "./staff.service";
import { StaffController } from "./staff.controller";
import { OptionProductEntity } from "src/entities/option.product.entity";
import { OrderDesignService } from "./order-design.service";
import { OrderDesignEntity } from "src/entities/order_design.entity";
import { AccountModule } from "../account/account.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([OrderEntity]),
        TypeOrmModule.forFeature([OptionProductEntity]),
        TypeOrmModule.forFeature([OrderDesignEntity]),
        AuthModule,
        AccountModule,
    ],
    controllers: [StaffController],
    providers: [
        {
            provide: "STAFF_SERVICE_TIENNT",
            useClass: StaffService
        },
        {
            provide: "ORDER_DESIGN_SERVICE_TIENNT",
            useClass: OrderDesignService
        }
    ],
})
export class StaffModule { }
