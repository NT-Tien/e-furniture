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

// OrderEntity {
//   id: '18185d2d-0eca-4133-97af-29eeb59ad3fe',
//   createdAt: 2024-01-30T05:37:25.967Z,
//   updatedAt: 2024-01-30T05:37:25.967Z,
//   deletedAt: null,
//   user_id: '0c170c8b-c751-41a5-bbd7-57b19b42d043',
//   total: '10000',
//   products: [
//     {
//       id: '861fb988-f356-4980-9d2b-ab7e013fa74a',
//       name: 'opt 1',
//       price: 2000,
//       material: 'wood',
//       quantity: 5,
//       product_id: '75154a82-c97d-4e94-a9df-293b2a3e7673'
//     }
//   ],
//   voucher_id: 'string',
//   address: 'thu duc12312312',
//   phone: '0356410582',
//   email: 'tienntse161099@fpt.edu.vn',
//   payment: null,
//   wallet_payment: null,
//   status_delivery: 'PENDING'
// }

// send mail for user paid
export async function sendMailForUserPaid(payload: any) {
  console.log('email:', payload);
  // read file html 
  var htmlContent = fs.readFileSync('./src/modules/payment/cronjob/mail/index.html', 'utf8');
  // replace contents
  var rootContent = '<p style="font-size: 14px; line-height: 200%;"><span style="color: #f7e1b5; font-size: 14px; line-height: 28px;">✓</span>  Campaign setup&amp; schedule</p>';
  var infoContent = `<p style="font-size: 14px; line-height: 200%;"><span style="color: #f7e1b5; font-size: 14px; line-height: 28px;">✓</span>Tổng giá trị:  ${payload.total}</p>`;
  var newContent = await payload.products.map((item: any) => {
    return `<p style="font-size: 14px; line-height: 200%;"><span
      style="color: #f7e1b5; font-size: 14px; line-height: 28px;">✓</span>  ${item.name} x ${item.quantity} x ${item.price}</p>`
  })
  var newHtmlContent = htmlContent.replace(rootContent, infoContent + newContent);
  const mailOptions = {
    from: 'trinhvinhphat16112003@gmail.com',
    to: payload.email,
    subject: 'Thông báo thanh toán thành công',
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

