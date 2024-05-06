import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { AccountModule } from './modules/account/account.module';
import { MyMiddlewareModule } from './middlewares/middleware.module';
import { TYPE_ORM_CONFIG } from './config/orm.config';
import { MongooseModule } from '@nestjs/mongoose';
import { MONGO_CONFIG, MONGO_HOST } from './config/mongo.config';
import { FileModule } from './modules/file-manager/file.module';
import { ProductModule } from './modules/product/product.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CartModule } from './modules/cart/cart.module';
import { BookingVisitModule } from './modules/booking-visit/booking-visit.module';
import { WishListModule } from './modules/wishlist/wishlist.module';
import { MailModule } from './modules/mail/mail.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { DstaffModule } from './modules/dstaff/dstaff.module';
import { VoucherModule } from './modules/voucher/voucher.module';
import { StaffModule } from './modules/staff/staff.module';
import { RateModule } from './modules/product/rate/rate.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(TYPE_ORM_CONFIG),
    MongooseModule.forRoot(MONGO_HOST, MONGO_CONFIG),
    AuthModule,
    MyMiddlewareModule,
    AccountModule,
    FileModule,
    ProductModule,
    PaymentModule,
    CartModule,
    BookingVisitModule,
    WishListModule,
    MailModule,
    StaffModule,
    DstaffModule,
    VoucherModule,
    RateModule,
  ], 
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor
    }
  ]
})
export class AppModule { } 