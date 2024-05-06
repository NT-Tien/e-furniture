import { Body, Controller, Delete, Get, Inject, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { OptionProductService } from "./option.product.service";
import { OptionProductEntity } from "src/entities/option.product.entity";
import { UserGuard } from "src/modules/auth/guards/user.guard";
import { AdminGuard } from "src/modules/auth/guards/admin.guard";
import { StaffGuard } from "src/modules/auth/guards/staff.guard";

@ApiTags('option-product')
@Controller('option-products')
export class OptionProductController {
    constructor(
        @Inject('OPTION_PRODUCT_SERVICE_TIENNT') private readonly optionProductService: OptionProductService,
    ) { }

    // get all option product
    @Get('/get-all')
    async getAllOptionProductByProductId() {
        return await this.optionProductService.getAll();
    }

    // get option product with id product   
    @Get('/get-all/:product_id')
    async getOptionProductByProductId(
        @Param('product_id') product_id: string,
    ) {
        return await this.optionProductService.getAllOptionProductByProductId(product_id);
    }

    // create option product with id product
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                product_id: { type: 'string' },
                name: { type: 'string' },
                material: { type: 'string' },
                price: { type: 'number' },
                quantity: { type: 'number' },
            },
        },
    })
    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Post('/create')
    async createOptionProduct(
        @Body() optionProduct: OptionProductEntity,
    ) {
        return await this.optionProductService.create(optionProduct);
    }

    @ApiBody({
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    product_id: { type: 'string' },
                    name: { type: 'string' },
                    material: { type: 'string' },
                    price: { type: 'number' },
                    quantity: { type: 'number' },
                },
            },
        },
    })
    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Post('/create-many')
    async createManyOptionProduct(
        @Body() optionProducts: OptionProductEntity[],
    ) {
        return await this.optionProductService.createManyOptionProducts(optionProducts);
    }

    // update option product with id option product
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                material: { type: 'string' },
                price: { type: 'number' },
                quantity: { type: 'number' },
            },
        },
    })
    @ApiBearerAuth()
    @UseGuards(StaffGuard)
    @Put('/update/:id')
    async updateOptionProduct(
        @Param('id') id: string,
        @Body() optionProduct: OptionProductEntity,
    ) {
        return await this.optionProductService.update(id, OptionProductEntity.plainToClass(optionProduct));
    }

    // soft delete option product with id option product
    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Delete('/delete/:id')
    async removeOptionProduct(
        @Param('id') id: string,
    ) {
        return await this.optionProductService.delete(id);
    }

    @ApiBody({
        schema: {
            type: 'array',
            items: {
                type: 'string',
                properties: {
                    id: { type: 'string' },
                }
            },
        },
    })
    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Delete('/delete-many')
    async removeOptionProductMany(
        @Body() ids: string[],
    ) {
        return await this.optionProductService.deleteManyOptionProducts(ids);
    }
}