import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryEntity } from "src/entities/category.entity";
import { ProductEntity } from "src/entities/product.entity";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { AuthModule } from "src/modules/auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([CategoryEntity]),
        AuthModule,
    ],
    controllers: [CategoryController],
    providers: [
        {
            provide: 'CATEGORY_SERVICE_PHATTV',
            useClass: CategoryService,
        }
    ],
    exports: [
        {
            provide: 'CATEGORY_SERVICE_PHATTV',
            useClass: CategoryService,
        }
    ],
})
export class CategoryModule { }