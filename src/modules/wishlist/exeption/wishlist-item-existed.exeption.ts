import { BadRequestException, NotFoundException } from "@nestjs/common";

export class WishListItemExistedExeption extends BadRequestException {
    constructor(message: string) {
        super(message);
    }
}