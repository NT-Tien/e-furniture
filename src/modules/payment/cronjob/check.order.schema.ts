import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WaiterDocument = HydratedDocument<Waiter>;

@Schema()
export class Waiter {
  @Prop()
  id_payment: string;

  @Prop()
  id_order: string;

  @Prop()
  products: Object[];

}

export const WaiterSchema = SchemaFactory.createForClass(Waiter);