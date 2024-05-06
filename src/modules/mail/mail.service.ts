import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) { }

    async sendBookingVisitToken(token: string, email: string) {
        await this.mailerService.sendMail({
            to: email,
            // from: '"Support Team" <support@example.com>', // override default from
            subject: 'Confirm booking visit',
            template: './token', // either change to ./transactional or rename transactional.html to confirmation.html
            context: {
                token: token
            },
        });
    }
}