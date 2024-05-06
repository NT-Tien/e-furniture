import { Body, Controller, Delete, Get, Inject, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from "@nestjs/swagger";
import { CategoryEntity } from "src/entities/category.entity";
import { CategoryService } from "./category.service";
import { AdminGuard } from "src/modules/auth/guards/admin.guard";

@ApiTags('category')
@Controller('category')
export class CategoryController {

    constructor(
        @Inject('CATEGORY_SERVICE_PHATTV') private readonly categoryService: CategoryService,
    ) { }

    @Get("/get-all")
    async getAll() {
        return await this.categoryService.getAllWithoutDeleted();
    }

    @UseGuards(AdminGuard)
    @Get('/get-all-deleted')
    async getAllDeleted() {
        return await this.categoryService.getAllDeleted();
    }

    @Get('/get-one/:id')
    async getOne(@Param('id') id: string) {
        return await this.categoryService.getOne(id);
    }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
            },
        },
    })
    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Post('/create')
    async create(@Body() body: CategoryEntity) {
        return await this.categoryService.create(body)
    }

    @UseGuards(AdminGuard)
    @Delete('/delete/:id')
    async delete(@Param('id') id: string) {
        return await this.categoryService.softDelete(id)
    }

    // restore category
    @UseGuards(AdminGuard)
    @Put('/restore/:id')
    async restore(@Param('id') id: string) {
        return await this.categoryService.restore(id)
    }
}