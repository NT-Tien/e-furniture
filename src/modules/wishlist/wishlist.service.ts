import { HttpException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import logging from "src/config/logging";
import { InjectModel } from "@nestjs/mongoose";
import { WishList, WishListDocument } from "./wishlist.schema";
import { Model } from "mongoose";
import { AccountService } from "../account/account.service";
import { AuthService } from "../auth/auth.service";
import { ProductService } from "../product/product.service";
import { Request } from "express";
import { AccountEntity } from "src/entities/account.entity";
import { ProductEntity } from "src/entities/product.entity";
import { WishListItemExistedExeption } from "./exeption/wishlist-item-existed.exeption";

@Injectable()
export class WishListService {
    constructor(@InjectModel(WishList.name) private wishlistModel: Model<WishList>,
        @Inject('ACCOUNT_SERVICE_TIENNT') private readonly accountService: AccountService,
        @Inject('AUTH_SERVICE_TIENNT') private readonly authService: AuthService,
        @Inject('PRODUCT_SERVICE_PHATTV') private readonly productService: ProductService) { }

    async extractEmailFromToken(req: Request): Promise<string> {
        return this.authService.getEmailFromToken(req?.headers?.authorization as string);
    }

    async getAccount(req: Request): Promise<AccountEntity> {
        logging.info("start extract email from token", "getAccount()")
        let email: string = await this.extractEmailFromToken(req)
            .then(rs => rs)
            .catch(error => {
                throw new InternalServerErrorException();
            })
        logging.info("email = " + email, "addToCart()")
        logging.info("start query account by email", "getAccount()")
        return this.accountService.getOneWithEmail(email);
    }

    async addToWishList(pid: string, req: Request): Promise<void> {
        logging.info("START !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", "addToWishList()")
        logging.info("Check if product exist", "addToWishList()")
        let product: ProductEntity = await this.productService.getOne(pid)
            .then(result => result)
            .catch(error => {
                logging.error(error, "addToWishList()")
                throw new InternalServerErrorException();
            });
        if (!product) {
            throw new HttpException('Product is not exist', 404);
        }
        logging.info("product: " + JSON.stringify(product), "addToWishList()")
        logging.info("product exist", "addToWishList()")

        //
        logging.info("start extract email from token", "addToWishList()")
        let email: string = await this.authService.getEmailFromToken(req?.headers?.authorization as string)
            .then(rs => rs)
            .catch(error => {
                throw new InternalServerErrorException();
            })
        logging.info("email = " + email, "addToWishList()")
        logging.info("start query account by email", "addToWishList()")
        let account: AccountEntity = await this.accountService.getOneWithEmail(email)
            .then(result => result)
            .catch(error => {
                throw new InternalServerErrorException();
            });
        logging.info("account: " + JSON.stringify(account), "addToWishList()")
        if (account) {
            let wishlist: WishListDocument = await this.wishlistModel
                .findOne({
                    account_id: account.id
                })
                .exec()
                .then(result => result)
                .catch(error => {
                    throw new InternalServerErrorException();
                });
            if (!wishlist) {
                wishlist = await new this.wishlistModel({
                    account_id: account.id,
                    list_product: []
                })
                    .save()
                    .then(rs => rs)
                    .catch(error => {
                        throw new InternalServerErrorException();
                    })
            }
            logging.info("wishlist: " + JSON.stringify(wishlist), "addToWishList()")
            let new_list_product = [...wishlist.list_product];
            for (let item of new_list_product) {
                if (item == pid) {
                    logging.info("item exist", "addToWishList()")
                    logging.info("END !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", "addToWishList()")
                    throw new WishListItemExistedExeption("this item is existed")
                }
            }
            logging.info("item not exist", "addToWishList()")
            new_list_product = [...wishlist.list_product, pid];
            wishlist.list_product = new_list_product;
            await wishlist.save();
        } else {
            throw new HttpException('Account not found', 404);
        }
        logging.info("END !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", "addToWishList()")
    }

    async getAllWishListPaging(limit: number, offset: number, req: Request) {
        let account: AccountEntity = await this.getAccount(req)
            .then(result => result)
            .catch(error => {
                throw new InternalServerErrorException();
            });
        logging.info("account: " + JSON.stringify(account), "getAllWishListPaging()");
        if (account) {
            let wishlist: WishListDocument = await this.wishlistModel
                .findOne({
                    account_id: account.id
                })
                .exec()
                .then(result => result)
                .catch(error => {
                    throw new InternalServerErrorException();
                });
            if (!wishlist) {
                logging.info("wishlist not exist, creat new wishlist", "getAllWishListPaging()")
                wishlist = await new this.wishlistModel({
                    account_id: account.id,
                    list_product: []
                })
                    .save()
                    .then(rs => rs)
                    .catch(error => {
                        throw new InternalServerErrorException();
                    })
            }
            logging.info("wishlist: " + JSON.stringify(wishlist), "getAllWishListPaging()")
            let list_product = wishlist.list_product;
            let result: any[] = new Array<any>()
            let offsetCalculated = (offset - 1) * limit
            limit = offsetCalculated + limit
            if (limit > wishlist.list_product.length) limit = wishlist.list_product.length;
            for (let i = offsetCalculated; i < limit; i++) {
                let product = await this.productService
                    .getOneProductWithCategoryWithOptProductsAllowNull(list_product[i])
                    .then(rs => rs)
                    .catch(error => {
                        throw new InternalServerErrorException();
                    })
                if (!product) {
                    this.deleteWishListItemByProId(list_product[i], req);
                } else {
                    result.push({
                        product: product
                    });
                }

            }
            return result;
        } else {
            throw new HttpException('Account not found', 404);
        }
    }

    async deleteWishListItemByProId(pid: string, req: Request) {
        let account: AccountEntity = await this.getAccount(req)
            .then(result => result)
            .catch(error => {
                throw new InternalServerErrorException();
            });
        logging.info("account: " + JSON.stringify(account), "deleteWishListItemByProId()");
        if (account) {
            let wishlist: WishListDocument = await this.wishlistModel
                .findOne({
                    account_id: account.id
                })
                .exec()
                .then(result => result)
                .catch(error => {
                    throw new InternalServerErrorException();
                });
            if (!wishlist) {
                logging.info("wishlist not exist, creat new cart", "deleteWishListItemByProId()")
                wishlist = await new this.wishlistModel({
                    account_id: account.id,
                    list_product: []
                })
                    .save()
                    .then(rs => rs)
                    .catch(error => {
                        throw new InternalServerErrorException();
                    })
            }
            logging.info("wishlist: " + JSON.stringify(wishlist), "deleteWishListItemByProId()")
            let new_list_product = [...wishlist.list_product];
            new_list_product = new_list_product.filter((item) => item != pid)
            wishlist.list_product = new_list_product;
            new this.wishlistModel(wishlist).save().then(rs => rs).catch(error => error);
        } else {
            throw new HttpException('Account not found', 404);
        }
    }

    async deleteAllWishListItem(req: Request) {
        let account: AccountEntity = await this.getAccount(req)
            .then(result => result)
            .catch(error => {
                throw new InternalServerErrorException();
            });
        logging.info("account: " + JSON.stringify(account), "deleteWishListItemByProId()");
        if (account) {
            let wishlist: WishListDocument = await this.wishlistModel
                .findOne({
                    account_id: account.id
                })
                .exec()
                .then(result => result)
                .catch(error => {
                    throw new InternalServerErrorException();
                });
            if (!wishlist) {
                logging.info("wishlist not exist, creat new cart", "deleteWishListItemByProId()")
                wishlist = await new this.wishlistModel({
                    account_id: account.id,
                    list_product: []
                })
                    .save()
                    .then(rs => rs)
                    .catch(error => {
                        throw new InternalServerErrorException();
                    })
            }
            logging.info("wishlist: " + JSON.stringify(wishlist), "deleteWishListItemByProId()")
            let new_list_product = []
            wishlist.list_product = new_list_product;
            new this.wishlistModel(wishlist).save().then(rs => rs).catch(error => error);
        } else {
            throw new HttpException('Account not found', 404);
        }
    }
}