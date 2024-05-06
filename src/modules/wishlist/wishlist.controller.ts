import { Controller, Delete, Get, Inject, Param, Put, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { WishListService } from "./wishlist.service";
import { Request } from "express";
import logging from "src/config/logging";

@ApiTags('wishlist')
@Controller('wishlist')
export class WishListController {
    constructor(
        @Inject('WISHLIST_SERVICE_PHATTV') private readonly wishListService: WishListService,
    ) { }

    @ApiBearerAuth()
    @Put("/add-to-wishlist/:product_id")
    async addToWishList(
        @Param('product_id') pid: string,
        @Req() req: Request
    ) {
        logging.info("product id: " + pid, "cart/addToWishList()")
        try {
            await this.wishListService.addToWishList(pid, req);
            return {
                statusCode: 200,
                message: "add product to wishlist successfully"
            }
        } catch (error) {
            logging.error(error, "cart/addToWishList()")
            return error;
        }
    }

    @ApiBearerAuth()
    @Get('/get-all/:size/:page')
    async getAll(
        @Param('size') size: number,
        @Param('page') page: number,
        @Req() req: Request
    ) {
        var limit = 100;
        var offset = 1;
        if (size > 0 && size < 100) limit = size;
        if (page > 0) offset = page;
        try {
            return await this.wishListService.getAllWishListPaging(limit, offset, req);
        } catch (error) {
            return JSON.stringify(error);
        }
    }

    @ApiBearerAuth()
    @Delete('/delete-all')
    async deleteAll(
        @Req() req: Request
    ) {
        try {
            await this.wishListService.deleteAllWishListItem(req);
            return {
                statusCode: 200,
                message: "delete wishlist item successfully"
            }
        } catch (error) {
            return JSON.stringify(error);
        }
    }

    @ApiBearerAuth()
    @Delete('/delete/:pid')
    async deleteByProId(
        @Param('pid') pid: string,
        @Req() req: Request
    ) {
        try {
            await this.wishListService.deleteWishListItemByProId(pid, req);
            return {
                statusCode: 200,
                message: "delete wishlist item successfully"
            }
        } catch (error) {
            return JSON.stringify(error);
        }
    }
}