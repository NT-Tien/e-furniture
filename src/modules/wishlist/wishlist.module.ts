import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WishList, WishListSchema } from "./wishlist.schema";
import { WishListController } from "./wishlist.controller";
import { WishListService } from "./wishlist.service";
import { AccountModule } from "../account/account.module";
import { ProductModule } from "../product/product.module";
import { AuthModule } from "../auth/auth.module";


@Module({
    imports: [
        MongooseModule.forFeature([{ name: WishList.name, schema: WishListSchema }]),
        AuthModule,
        AccountModule,
        ProductModule
    ],
    controllers: [
        WishListController
    ],
    providers: [
        {
            provide: 'WISHLIST_SERVICE_PHATTV',
            useClass: WishListService,
        }
    ],
    exports: [
        {
            provide: 'WISHLIST_SERVICE_PHATTV',
            useClass: WishListService,
        }
    ],
})
export class WishListModule { }