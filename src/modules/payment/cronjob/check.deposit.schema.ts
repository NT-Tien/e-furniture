import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WaiterDepositDocument = HydratedDocument<WaiterDeposit>;

@Schema()
export class WaiterDeposit {
  @Prop()
  id_payment: string;

  @Prop()
  id_transaction: string;

  @Prop()
  amount: number;

}

export const WaiterDepositSchema = SchemaFactory.createForClass(WaiterDeposit);