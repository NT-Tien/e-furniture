import { Body, Controller, Get, Inject, Param, Post, Put, UseGuards } from "@nestjs/common";
import { StaffService } from "./staff.service";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { StaffGuard } from "../auth/guards/staff.guard";
import { OrderDesignService } from "./order-design.service";
import { UserGuard } from "../auth/guards/user.guard";

@ApiTags('staff')
@Controller('staff')
export class StaffController {
    constructor(
        @Inject('STAFF_SERVICE_TIENNT') private readonly staffService: StaffService,
        @Inject('ORDER_DESIGN_SERVICE_TIENNT') private readonly orderDesignService: OrderDesignService,
    ) { }

    // update quantity product in stock
    @ApiBearerAuth()
    @UseGuards(StaffGuard)
    @Put('/update-quantity-product-in-stock/:id/:quantity')
    async updateQuantityProductInStock(
        @Param('id') id: string,
        @Param('quantity') quantity: number,
    ){
        return await this.staffService.updateQuantityProductInStock(id, quantity);
    }

    // order custome design
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string' },
                file: {type: 'string'},
                username: {type: 'string'},
                phone: {type: 'string'},
                address: {type: 'string'}
            }
        },
    })
    @ApiBearerAuth()
    @UseGuards(UserGuard)
    @Post('/order-custome-design')
    async orderCustomeDesign(@Body() body: any){
        return await this.orderDesignService.orderCustomeDesign(body);
    }

    // get list order design by user ID
    @ApiBearerAuth()
    @UseGuards(StaffGuard)
    @Get('/get-list-order-design')
    async getListOrderDesignByUserId(){
        return await this.orderDesignService.getAll();
    }

    // get list by email in account
    @ApiBearerAuth()
    @UseGuards(UserGuard)
    @Get('/get-list-order-design-by-email/:email')
    async getListByEmail(@Param('email') email: string){
        return await this.orderDesignService.getListByEmail(email);
    }

    // update price order design
    @ApiBearerAuth()
    @UseGuards(StaffGuard)
    @Put('/update-price-order-design/:id/:price')
    async updatePriceOrderDesign(@Param('id') id: string, @Param('price') price: number){
        return await this.orderDesignService.updatePriceOrderDesign(id, price);
    }

    // send email to user 
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string' },
                id_order: {type: 'string'}
            }
        },
    })
    @ApiBearerAuth()
    @UseGuards(StaffGuard)
    @Post('/send-email-to-user')
    async sendEmailToUser(@Body() body: {email: string, id_order: string}){
        return await this.orderDesignService.sendEmailToUser(body.email, body.id_order);
    }

    // send email denied to user
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string' },
                id_order: {type: 'string'}
            }
        },
    })
    @ApiBearerAuth()
    @UseGuards(StaffGuard)
    @Post('/send-email-denied-to-user')
    async sendEmailDeniedToUser(@Body() body: {email: string, id_order: string}){
        return await this.orderDesignService.sendEmailDeniedToUser(body.email, body.id_order);
    }

    // update isPaid field
    @ApiBearerAuth()
    @UseGuards(StaffGuard)
    @Put('/update-is-paid/:orderCus_id')
    async updateIsPaid(@Param('orderCus_id') orderCus_id: string){
        return await this.orderDesignService.updateIsPaid(orderCus_id);
    }

 }