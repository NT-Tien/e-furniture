import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CartDocument = HydratedDocument<Cart>;

export type cartItem = {
    quantity: number,
    product_id: string,
    optionId: string
}

@Schema()
export class Cart {
    @Prop()
    account_id: string;

    @Prop()
    list_product: cartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);