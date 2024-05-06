import { Body, Controller, Delete, Get, HttpException, Inject, NotFoundException, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { FilterObject, ProductService } from "./product.service";
import { ProductEntity } from "src/entities/product.entity";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags('product')
@Controller('product')
export class ProductController {
    constructor(
        @Inject('PRODUCT_SERVICE_PHATTV') private readonly productService: ProductService,
    ) { }

    @ApiParam({
        name: 'size',
        type: 'number',
        description: 'number of records',
        required: false,
    })
    @ApiParam({
        name: 'page',
        type: 'number',
        description: 'page number',
        required: false,
    })
    @Get('/get-all/:size/:page')
    @ApiQuery({ name: 'query', required: false })
    @ApiQuery({ name: 'categoryId', required: false })
    @ApiQuery({ name: 'sortBy', required: false })
    @ApiQuery({ name: 'direction', required: false })
    async getAll(
        @Param('size') size: number,
        @Param('page') page: number,
        @Query("query") query: string = "",
        @Query("categoryId") categoryId: string = "",
        @Query("sortBy") sortBy: string = "id",
        @Query("direction") direction: string = "DESC" 
    ) {
        var limit = 100;
        var offset = 1;
        if (size > 0 && size < 100) limit = size;
        if (page > 0) offset = page;
        return await this.productService.getAllPaging(limit, offset, {
            query,
            categoryId,
            sortBy,
            direction
        } as FilterObject);
    }

    @ApiParam({
        name: 'size',
        type: 'number',
        description: 'number of records',
        required: false,
    })
    @ApiParam({
        name: 'page',
        type: 'number',
        description: 'page number',
        required: false,
    })
    @UseGuards(AdminGuard)
    @Get('/get-all-deleted/:size/:page')
    async getAllDeleted(
        @Param('size') size: number,
        @Param('page') page: number,
    ) {
        var limit = 100;
        var offset = 1;
        if (size > 0 && size < 100) limit = size;
        if (page > 0) offset = page;
        return await this.productService.getAllPagingDeleted(limit, offset);
    }

    @Get('/get-by-name/:name')
    async getByName(@Param('name') name: string) {
        return await this.productService.getPorudctByName(name);
    }

    @Get('/get-one/:id')
    async getOne(@Param('id') id: string) {
        return await this.productService.getOneProductWithCategoryWithOptProducts(id)
    }


    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                images: {
                    "type": "array",
                    "items": { "type": "string" }
                },
                category_id: { type: 'string' },
                description: { type: 'string' }
            },
        },
    })
    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Post('/create')
    async create(@Body() body: ProductEntity) {
        return await this.productService.create(body);
    }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                images: {
                    "type": "array",
                    "items": { "type": "string" }
                },
                category_id: { type: 'string' },
                description: { type: 'string' }
            },
        },
    })
    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Put('/update/:id')
    async update(@Param('id') id: string, @Body() body: ProductEntity) {
        return await this.productService.update(id, ProductEntity.plainToClass(body))
    }

    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Delete('/delete/:id')
    async delete(@Param('id') id: string,) {
        return await this.productService.delete(id);
    }

    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Delete('/soft-delete/:id')
    async softDelete(@Param('id') id: string,) {
        return await this.productService.softDelete(id);
    }

    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Put('/restore/:id')
    async restore(@Param('id') id: string,) {
        return await this.productService.update(id, { deletedAt: null });
    }
}