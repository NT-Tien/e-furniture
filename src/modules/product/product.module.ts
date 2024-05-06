import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductEntity } from "src/entities/product.entity";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { OptionProductEntity } from "src/entities/option.product.entity";
import { OptionProductService } from "./option.product/option.product.service";
import { OptionProductController } from "./option.product/option.product.controller";
import { CategoryModule } from "./category/category.module";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([ProductEntity]),
        TypeOrmModule.forFeature([OptionProductEntity]),
        CategoryModule,
        AuthModule,
    ],
    controllers: [
        ProductController,
        OptionProductController,
    ],
    providers: [
        {
            provide: 'PRODUCT_SERVICE_PHATTV',
            useClass: ProductService,
        },
        {
            provide: 'OPTION_PRODUCT_SERVICE_TIENNT',
            useClass: OptionProductService,
        }
    ],
    exports: [
        {
            provide: 'PRODUCT_SERVICE_PHATTV',
            useClass: ProductService,
        },
        {
            provide: 'OPTION_PRODUCT_SERVICE_TIENNT',
            useClass: OptionProductService,
        }
    ],
})
export class ProductModule { }