import { Body, Controller, Get, Inject, InternalServerErrorException, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { BookingVisitService } from "./booking-visit.service";
import { BookingVisit } from "./booking-visit.schema";
import { generateSixNumberRandom } from "src/utils/random.utils";
import { redisClientLocal } from "src/config/redis.client";
import { MailService } from "../mail/mail.service";
import logging from "src/config/logging";

@ApiTags('booking-visit')
@Controller('booking-visit')
export class BookingVisitController {
    constructor(
        @Inject('BOOKING_SERVICE_PHATTV') private readonly bookingVisitService: BookingVisitService,
        @Inject('MAIL_SERVICE_PHATTV') private readonly mailService: MailService
    ) { }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string' },
                visit_date: { type: 'number' },
                phone_number: { type: 'string' },
                customer_name: { type: 'string' }
            },
        },
    })
    @Post("/create")
    async createBookingVisit(@Body() bookingVisit: BookingVisit) {
        try {
            let ramdomNumber: string = generateSixNumberRandom()
            let client = redisClientLocal;
            client.set(ramdomNumber, JSON.stringify(bookingVisit), 'EX', 1000 * 60);
            let result = await client.get(ramdomNumber)
            this.mailService.sendBookingVisitToken(ramdomNumber, bookingVisit.email)
            return {
                statusCode: 200,
                message: "booking created successfully",
                data: JSON.stringify(result)
            };

        } catch (error) {
            logging.error(JSON.stringify(error), "createBookingVisit()")
            throw new InternalServerErrorException();
        }
    }

    @Post("/create/verify/:token")
    async verifyBookingVisitToken(@Param("token") token: string) {
        try {
            let client = redisClientLocal;
            let result = await client.get(token)
            if (!result) {
                return {
                    statusCode: 400,
                    message: "Token not existed",
                };
            } else {
                await client.del(token)
                await this.bookingVisitService.createBookingVisit(JSON.parse(result));
                return {
                    statusCode: 200,
                    message: "booking created successfully",
                    data: JSON.stringify(result)
                };
            }
        } catch (error) {
            logging.error(JSON.stringify(error), "createBookingVisit()")
            throw new InternalServerErrorException();
        }
    }

    @ApiBearerAuth()
    @Get('/get-all/:size/:page')
    async getAll(
        @Param('size') size: number,
        @Param('page') page: number,
    ) {
        var limit = 100;
        var offset = 1;
        if (size > 0 && size < 100) limit = size;
        if (page > 0) offset = page;
        try {
            return this.bookingVisitService.getAllCartPaging(limit, offset);
        } catch (error) {
            return JSON.stringify(error);
        }
    }
}