import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CartService } from "./cart.service";
import { Cart } from "./cart.schema";
import logging from "src/config/logging";
import { Request } from "express";


@ApiTags('cart')
@Controller('cart')
export class CartController {
    constructor(
        @Inject('CART_SERVICE_PHATTV') private readonly cartService: CartService,
    ) { }

    @ApiBearerAuth()
    @Put("/add-to-cart/:product_id/:optionId")
    async addToCart(
        @Param('product_id') pid: string,
        @Param('optionId') optionId: string,
        @Req() req: Request
    ) {
        logging.info("product id: " + pid, "cart/addToCart()")
        try {
            await this.cartService.addToCart(pid, optionId, req);
            return {
                statusCode: 200,
                message: "add product to cart successfully"
            }
        } catch (error) {
            logging.error(error, "cart/addToCart()")
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
            return await this.cartService.getAllCartPaging(limit, offset, req);
        } catch (error) {
            return JSON.stringify(error);
        }
    }

    @ApiBearerAuth()
    @Delete('/delete/:pid/:optionId')
    async deleteByProId(
        @Param('pid') pid: string,
        @Param('optionId') optionId: string,
        @Req() req: Request
    ) {
        try {
            await this.cartService.deleteCartItemByProIdAndOptId(pid, optionId, req);
            return {
                statusCode: 200,
                message: "delete cart item successfully"
            }
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
            await this.cartService.deleteAllCartItem(req);
            return {
                statusCode: 200,
                message: "delete cart item successfully"
            }
        } catch (error) {
            return JSON.stringify(error);
        }
    }


    @ApiBearerAuth()
    @Put('/update-quantity/:pid/:optionId/:amount')
    async updateQuantity(
        @Param('pid') pid: string,
        @Param('optionId') optionId: string,
        @Param('amount') amount: number,
        @Req() req: Request
    ) {
        try {
            await this.cartService.updateQuantity(pid, optionId , amount, req);
            return {
                statusCode: 200,
                message: "update cart item amount successfully"
            }
        } catch (error) {
            return JSON.stringify(error);
        }
    }
}