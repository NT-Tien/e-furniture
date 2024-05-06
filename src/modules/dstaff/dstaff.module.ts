import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderEntity } from "src/entities/order.entity";
import { DstaffController } from "./dstaff.controller";
import { DstaffService } from "./dstaff.service";
import { DstaffGateway } from "./dstaff.gateway";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([OrderEntity]),
        AuthModule,
    ],
    controllers: [DstaffController],
    providers: [
        // DstaffGateway,
        {
            provide: "DSTAFF_SERVICE_TIENNT",
            useClass: DstaffService
        },
    ],
})
export class DstaffModule { }
