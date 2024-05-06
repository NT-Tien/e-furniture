import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Cart, CartSchema } from "./cart.schema";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";
import { AuthModule } from "../auth/auth.module";
import { AccountModule } from "../account/account.module";
import { ProductModule } from "../product/product.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
        AuthModule,
        AccountModule,
        ProductModule
    ],
    controllers: [
        CartController,
    ],
    providers: [
        {
            provide: 'CART_SERVICE_PHATTV',
            useClass: CartService,
        }
    ],
    exports: [
        {
            provide: 'CART_SERVICE_PHATTV',
            useClass: CartService,
        }
    ],
})
export class CartModule { }