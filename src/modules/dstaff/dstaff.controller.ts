import { Controller, Get, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { DstaffService } from "./dstaff.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { DstaffGuard } from "../auth/guards/dstaff.guard";

@ApiTags('dstaff')
@Controller('dstaff')
export class DstaffController {
    constructor(
        @Inject('DSTAFF_SERVICE_TIENNT') private readonly dstaffService: DstaffService,
    ) { }

    @ApiBearerAuth()
    @UseGuards(DstaffGuard)
    @Get('/get-all')
    async getAll() {
        return await this.dstaffService.getAll();
    }
    @ApiBearerAuth()
    @UseGuards(DstaffGuard)
    @Get('/get-order-need-to-shipping')
    async getAllOrderNeedToShipping(){
        return await this.dstaffService.getAllOrderNeedToShipping();
    }

    @ApiBearerAuth()
    @UseGuards(DstaffGuard)
    @Get('/check-order-delivered-in-month')
    async checkOrderDeliveredInMonth(){
        return await this.dstaffService.checkOrderDeliveredInMonth();
    }

    @ApiBearerAuth()
    @UseGuards(DstaffGuard)
    @Post('/update-status-order-delivered/:id')
    async updateStatusOrderDelivered(
        @Param('id') id: string,
    ){
        return await this.dstaffService.updateStatusOrderDelivered(id);
    }

    @ApiBearerAuth()
    @UseGuards(DstaffGuard)
    @Post('/update-status-order-shipping/:id')
    async updateStatusOrderShipping(
        @Param('id') id: string,
    ){
        return await this.dstaffService.updateStatusOrderShipping(id);
    }

    @ApiBearerAuth()
    @UseGuards(DstaffGuard)
    @Post('/update-status-order-cancel/:id')
    async updateStatusOrderCancel(
        @Param('id') id: string,
    ){
        return await this.dstaffService.updateStatusOrderCanceled(id);
    }


 }