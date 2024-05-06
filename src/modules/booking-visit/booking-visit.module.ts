import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BookingVisit, BookingVisitSchema } from "./booking-visit.schema";
import { BookingVisitService } from "./booking-visit.service";
import { BookingVisitController } from "./booking-visit.controller";


@Module({
    imports: [
        MongooseModule.forFeature([{ name: BookingVisit.name, schema: BookingVisitSchema }]),
    ],
    controllers: [
        BookingVisitController
    ],
    providers: [
        {
            provide: 'BOOKING_SERVICE_PHATTV',
            useClass: BookingVisitService,
        }
    ],
    exports: [
        {
            provide: 'BOOKING_SERVICE_PHATTV',
            useClass: BookingVisitService,
        }
    ],
})
export class BookingVisitModule { }