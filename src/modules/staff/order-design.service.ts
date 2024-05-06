import { HttpException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/base.service";
import { OrderDesignEntity } from "src/entities/order_design.entity";
import { Repository } from "typeorm";
import { AccountService } from "../account/account.service";
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as dotenv from 'dotenv';


dotenv.config();

// Tạo một transporter với thông tin đăng nhập của bạn
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'trinhvinhphat16112003@gmail.com',
    pass: process.env.MAIL_KEY
  }
});

async function sendMailAlert(payload: any) {
  console.log('email:', payload);
  // read file html 
  var htmlContent = fs.readFileSync('./src/modules/staff/mail/index.html', 'utf8');
  // replace contents
  var rootContent = '<p style="font-size: 14px; line-height: 200%;"><span style="color: #f7e1b5; font-size: 14px; line-height: 28px;">✓</span>  Campaign setup&amp; schedule</p>';
  var usernameContent = `<p style="font-size: 14px; line-height: 200%;"><span style="color: #f7e1b5; font-size: 14px; line-height: 28px;">✓</span> Họ và tên:  ${payload.username}</p>`;
  var phoneContent = `<p style="font-size: 14px; line-height: 200%;"><span style="color: #f7e1b5; font-size: 14px; line-height: 28px;">✓</span> Số điện thoại:  ${payload.phone}</p>`;
  var addressContent = `<p style="font-size: 14px; line-height: 200%;"><span style="color: #f7e1b5; font-size: 14px; line-height: 28px;">✓</span> Địa chỉ:  ${payload.address}</p>`;
  var infoContent = `<p style="font-size: 14px; line-height: 200%;"><span style="color: #f7e1b5; font-size: 14px; line-height: 28px;">✓</span>Báo giá:  ${payload.set_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>`;
  var newContent = `<p style="font-size: 14px; line-height: 200%;"><span style="color: #f7e1b5; font-size: 14px; line-height: 28px;">✓</span> Thông tin design:  <a href="${payload.file.replace('image', 'https://api.caucalamdev.io.vn/file/show-pdf')}" style="color: aqua">đường dẫn</a></p>`
  var newHtmlContent = htmlContent.replace(rootContent, usernameContent + phoneContent + addressContent + infoContent + newContent);
  const mailOptions = {
    from: 'trinhvinhphat16112003@gmail.com',
    to: payload.email,
    subject: 'Thông báo giá thiết kế',
    html: newHtmlContent
  }

  transporter.sendMail(mailOptions, function (error: any, info: any) {
    if (error) {
      console.error(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}


async function sendMailDenied(payload: any) {
  console.log('email:', payload);
  // read file html 
  var htmlContent = fs.readFileSync('./src/modules/staff/mail/denied.html', 'utf8');
  // replace contents
  var rootContent = '<p style="font-size: 14px; line-height: 200%;"><span style="color: #f7e1b5; font-size: 14px; line-height: 28px;">✓</span>  Campaign setup&amp; schedule</p>';
  var usernameContent = `<p style="font-size: 14px; line-height: 200%;"><span style="color: #f7e1b5; font-size: 14px; line-height: 28px;">✓</span> Họ và tên:  ${payload.username}</p>`;
  var phoneContent = `<p style="font-size: 14px; line-height: 200%;"><span style="color: #f7e1b5; font-size: 14px; line-height: 28px;">✓</span> Số điện thoại:  ${payload.phone}</p>`;
  var addressContent = `<p style="font-size: 14px; line-height: 200%;"><span style="color: #f7e1b5; font-size: 14px; line-height: 28px;">✓</span> Địa chỉ:  ${payload.address}</p>`;
  var infoContent = `<p style="font-size: 14px; line-height: 200%;"><span style="color: #f7e1b5; font-size: 14px; line-height: 28px;">✓</span>Báo giá:  ${payload?.set_price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>`;
  var newContent = `<p style="font-size: 14px; line-height: 200%;"><span style="color: #f7e1b5; font-size: 14px; line-height: 28px;">✓</span> Thông tin design:  <a href="${payload.file.replace('image', 'https://api.caucalamdev.io.vn/file/show-pdf')}" style="color: aqua">đường dẫn</a></p>`
  var newHtmlContent = htmlContent.replace(rootContent, usernameContent + phoneContent + addressContent + infoContent + newContent);
  const mailOptions = {
    from: 'trinhvinhphat16112003@gmail.com',
    to: payload.email,
    subject: 'Thông báo huỷ đơn thiết kế',
    html: newHtmlContent
  }

  transporter.sendMail(mailOptions, function (error: any, info: any) {
    if (error) {
      console.error(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

@Injectable()
export class OrderDesignService extends BaseService<OrderDesignEntity> {
  constructor(
    @InjectRepository(OrderDesignEntity) private readonly orderDesignRepository: Repository<OrderDesignEntity>,
    @Inject('ACCOUNT_SERVICE_TIENNT') private readonly accountService: AccountService,
  ) {
    super(orderDesignRepository);
  }

  async orderCustomeDesign(data: any) {
    return await this.orderDesignRepository.save(data);
  }

  async getListByEmail(email: string) {
    var account = await this.accountService.getOneWithEmail(email);
    if (!account) {
      throw new HttpException('Account not found', 404);
    }
    return await this.orderDesignRepository.find({ where: { user_id: account.id } });
  }

  async updatePriceOrderDesign(id: string, price: number) {
    var orderDesign = await this.getOne(id);
    if (!orderDesign) {
      throw new HttpException('Order design not found', 404);
    }
    orderDesign.set_price = price;
    return await this.orderDesignRepository.update(id, { set_price: price });
  }

  async sendEmailToUser(email: string, id_order: string) {
    var orderDesign = await this.getOne(id_order);
    if (!orderDesign) {
      throw new HttpException('Order design not found', 404);
    }
    console.log('orderDesign:', orderDesign);
    try {
      await sendMailAlert({
        email: email,
        ...orderDesign
      });
      // set field isMailed
      await this.orderDesignRepository.update(id_order, { isMailed: true });
      return { message: 'Send email success' };
    } catch (error) {
      throw new HttpException('Send email failed', 400);
    }

  }

  async sendEmailDeniedToUser(email: string, id_order: string) {
    var orderDesign = await this.getOne(id_order);
    if (!orderDesign) {
      throw new HttpException('Order design not found', 404);
    }
    console.log('orderDesign:', orderDesign);
    try {
      await sendMailDenied({
        email: email,
        ...orderDesign
      });
      // set field isMailed
      await this.orderDesignRepository.update(id_order, { isDenied: true });
      return { message: 'Send email success' };
    } catch (error) {
      console.log(error);
      throw new HttpException('Send email failed', 400);
    }
  }

  async updateIsPaid(orderCus_id: string) {
    return await this.orderDesignRepository.update(orderCus_id, { isPaid: true });
  }

}