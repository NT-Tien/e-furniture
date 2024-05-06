import { Body, Controller, Get, Headers, Inject, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { OrderEntity } from "src/entities/order.entity";
import { UserGuard } from "../auth/guards/user.guard";
import { AuthService } from "../auth/auth.service";
import { AccountService } from "../account/account.service";
import { StaffGuard } from "../auth/guards/staff.guard";

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
    constructor(
        @Inject('PAYMENT_SERVICE_TIENNT') private readonly paymentService: PaymentService,
        @Inject('AUTH_SERVICE_TIENNT') private readonly authService: AuthService,
        @Inject('ACCOUNT_SERVICE_TIENNT') private readonly accountService: AccountService,
    ) { }

    @Get('/get-all')
    async getAll() {
        return this.paymentService.getAll();
    }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string' },
                total: { type: 'number' },
                products: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            product_id: { type: 'string' },
                            name: { type: 'string' },
                            material: { type: 'string' },
                            price: { type: 'number' },
                            quantity: { type: 'number' },
                        }
                    }
                },
                voucher_id: { type: 'string', nullable: true },
                address: { type: 'string', default: 'thu duc' },
                phone: { type: 'string', default: '0356410582' },
                email: { type: 'string', default: 'tienntse161099@fpt.edu.vn' }
            },
        },
    })
    @Post('/create-order')
    async createOrder(@Body() body: OrderEntity) {
        return await this.paymentService.createLinkPayment(body);
    }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string' },
                total: { type: 'number' },
                products: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            product_id: { type: 'string' },
                            name: { type: 'string' },
                            material: { type: 'string' },
                            price: { type: 'number' },
                            quantity: { type: 'number' },
                        }
                    }
                },
                voucher_id: { type: 'string', nullable: true },
                address: { type: 'string', default: 'thu duc' },
                phone: { type: 'string', default: '0356410582' },
                email: { type: 'string', default: 'tienntse161099@fpt.edu.vn' }
            },
        },
    })
    @ApiBearerAuth()
    @UseGuards(UserGuard)
    @Post('/pay-with-wallet')
    async payWithWallet(@Body() body: any) {
        return await this.paymentService.payWithWallet(body);
    }

    @Get('/info/:orderCode')
    async getInfoOrder(@Param('orderCode') orderCode: string) {
        return await this.paymentService.checkIdOrder(orderCode);
    }

    @ApiBearerAuth()
    @UseGuards(UserGuard)
    @Get('/get-by-user')
    async getByUser(@Req() req: any){
        var token = req.headers.authorization.split(' ')[1];
        var email = await this.authService.getEmailFromToken(token);
        var result = await this.accountService.getOneWithEmail(email);
        return await this.paymentService.getOrderByUser(result.id);
    }

    @ApiBearerAuth()
    @UseGuards(StaffGuard)
    @Get('/get-most-popular-products')
    async getMostPopularProducts() {
        return await this.paymentService.getMostPopularProducts();
    }
} 