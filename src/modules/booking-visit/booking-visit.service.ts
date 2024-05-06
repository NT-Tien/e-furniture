import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { BookingVisit, BookingVisitDocument } from "./booking-visit.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class BookingVisitService {

    constructor(@InjectModel(BookingVisit.name) private bookingVisitModel: Model<BookingVisit>) { }

    async createBookingVisit(bookingVisit: BookingVisit) {
        await new this.bookingVisitModel({
            visit_date: bookingVisit.visit_date,
            phone_number: bookingVisit.phone_number,
            customer_name: bookingVisit.customer_name,
            email: bookingVisit.email
        })
            .save()
            .then(rs => rs)
            .catch(error => {
                throw new InternalServerErrorException();
            })
    }

    async getAllCartPaging(limit: number, offset: number) {
        let bookingVisitDocuments: BookingVisitDocument[] = await this.bookingVisitModel
            .find()
            .skip((offset - 1) * limit)
            .limit(limit)
            .exec()
            .then(rs => rs)
            .catch(err => {
                throw new InternalServerErrorException();
            })
            let totalItem = await this.bookingVisitModel.countDocuments().exec()
            let result: any = Array<any>();
            for (const item of bookingVisitDocuments) {
                result.push({
                    visit_date: new Date(item.visit_date).toLocaleDateString() + " " + new Date(item.visit_date).toTimeString().substring(0, 8),
                    phone_number: item.phone_number,
                    customer_name: item.customer_name,
                    email: item.email
                })
            }
            return {
                data: result,
                totalItem: totalItem
            }
    }
}