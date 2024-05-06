import { Body, Controller, Get, Inject, Param, Post, Put, UseGuards } from "@nestjs/common";
import { VoucherService } from "./voucher.service";
import { VoucherEntity } from "src/entities/voucher.entity";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags('voucher')
@Controller('voucher')
export class VoucherController {
    constructor(
        @Inject('VOUCHER_SERVICE') private readonly voucherService: VoucherService,
    ) { }

    @Get('/get-all')
    async getAll() {
        return await this.voucherService.getAll();
    }

    @Get('/get-one/:id')
    async getOne(
        @Param('id') id: string,
    ) {
        return await this.voucherService.getOne(id);
    }

    @Get('/get-one-with-code/:code')
    async getOneWithCode(
        @Param('code') code: string,
    ) {
        return await this.voucherService.getOneWithCode(code);
    }

    @UseGuards(AdminGuard)
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                code: {
                    type: 'string',
                },
                expired_date: {
                    type: 'string',
                    example: '2024-02-19 14:30:40.320257',
                },
                amount: {
                    type: 'number',
                },
                limit_total_max: {
                    type: 'number',
                },
                limit_total_min: {
                    type: 'number',
                },
                discount_percent: {
                    type: 'number',
                },
            },
        },
    })
    @Post('/create')
    async create(
        @Body() voucher: any,
    ) {
        return await this.voucherService.create(voucher);
    }

    @UseGuards(AdminGuard)
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                code: {
                    type: 'string',
                },
                expired_date: {
                    type: 'string',
                    example: '2024-02-19 14:30:40.320257',
                },
                amount: {
                    type: 'number',
                },
                limit_total_max: {
                    type: 'number',
                },
                limit_total_min: {
                    type: 'number',
                },
                discount_percent: {
                    type: 'number',
                },
            },
        },
    })
    @Put('/update/:id')
    async update(
        @Param('id') id: string,
        @Body() voucher: any,
    ) {
        return await this.voucherService.update(id, VoucherEntity.plainToClass(voucher));
    }

    @UseGuards(AdminGuard)
    @Put('/delete/:id')
    async delete(
        @Param('id') id: string,
    ) {
        return await this.voucherService.update(id, {
            deletedAt: new Date(),
        });
    }

}