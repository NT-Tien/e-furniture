import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BookingVisitDocument = HydratedDocument<BookingVisit>;

@Schema()
export class BookingVisit {
    @Prop()
    visit_date: number;

    @Prop()
    phone_number: string;

    @Prop()
    email: string;

    @Prop()
    customer_name: string;
}

export const BookingVisitSchema = SchemaFactory.createForClass(BookingVisit);