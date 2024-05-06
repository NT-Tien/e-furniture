import { Body, Controller, Get, Inject, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from "@nestjs/swagger";
import { RateService } from "./rate.service";
import { UserGuard } from "src/modules/auth/guards/user.guard";
import { AdminGuard } from "src/modules/auth/guards/admin.guard";
import { RateEntity } from "src/entities/rate.entity";

@ApiTags('rate')
@Controller('rate')
export class RateController {
    constructor(
        @Inject('RATE_SERVICE_TIENNT') private readonly rateService: RateService,
    ) { }

    // get all rate with product id
    @UseGuards(AdminGuard)
    @Get('product/:id')
    @ApiParam({ name: 'id', required: true })
    async getAll(@Param('id') id: string) {
        return await this.rateService.getAllRate(id);
    }
    // get abs rate and number of rates
    @Get('product/abs/:id')
    @ApiParam({ name: 'id', required: true })
    async getAbsRate(@Param('id') id: string) {
        return await this.rateService.getAbsRate(id);
    }

    // status of rate with list product id
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string' },
            }
        }
    })
    @ApiBearerAuth()
    @UseGuards(UserGuard)
    @Post('status-rate-with-user-id')
    async getStatusRate(@Body() body: { user_id: string }) {
        return await this.rateService.getStatusRate(body.user_id);
    }

    // add rate or update
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string' },
                product_id: { type: 'string' },
                rate: { type: 'number' }
            }
        }
    })
    @UseGuards(UserGuard)
    @Post('rating')
    async updateRate(@Body() body: { user_id: string, product_id: string, rate: number }) {
        return await this.rateService.rating(body.user_id, body.product_id, body.rate);
    }

}