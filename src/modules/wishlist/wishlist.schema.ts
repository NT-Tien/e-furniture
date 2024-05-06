import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WishListDocument = HydratedDocument<WishList>;

@Schema()
export class WishList {
    @Prop()
    account_id: string;

    @Prop()
    list_product: string[];
}

export const WishListSchema = SchemaFactory.createForClass(WishList);