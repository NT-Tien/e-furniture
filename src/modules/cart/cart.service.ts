import { HttpException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cart, CartDocument, cartItem } from "./cart.schema";
import { Model } from "mongoose";
import { AccountService } from "../account/account.service";
import { AccountEntity } from "src/entities/account.entity";
import logging from "src/config/logging";
import { Request } from "express";
import { ProductService } from "../product/product.service";
import { ProductEntity } from "src/entities/product.entity";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class CartService {
    constructor(@InjectModel(Cart.name) private cartModel: Model<Cart>,
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

    async addToCart(pid: string, optionId: string, req: Request): Promise<void> {
        logging.info("START !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", "addToCart()")
        logging.info("Check if product exist", "addToCart()")
        let product: ProductEntity = await this.productService.getOne(pid)
            .then(result => result)
            .catch(error => {
                logging.error(error, "addToCart()")
                throw new InternalServerErrorException();
            });
        if (!product) {
            throw new HttpException('Product is not exist', 404)
        }
        logging.info("product: " + JSON.stringify(product), "addToCart()")
        logging.info("product exist", "addToCart()")

        //
        logging.info("start extract email from token", "addToCart()")
        let email: string = await this.authService.getEmailFromToken(req?.headers?.authorization as string)
            .then(rs => rs)
            .catch(error => {
                console.log(error)
                throw new InternalServerErrorException();
            })
        logging.info("email = " + email, "addToCart()")
        logging.info("start query account by email", "addToCart()")
        let account: AccountEntity = await this.accountService.getOneWithEmail(email)
            .then(result => result)
            .catch(error => {
                throw new InternalServerErrorException();
            });
        logging.info("account: " + JSON.stringify(account), "addToCart()")
        if (account) {
            let cart: CartDocument = await this.cartModel
                .findOne({
                    account_id: account.id
                })
                .exec()
                .then(result => result)
                .catch(error => {
                    throw new InternalServerErrorException();
                });
            if (!cart) {
                cart = await new this.cartModel({
                    account_id: account.id,
                    list_product: []
                })
                    .save()
                    .then(rs => rs)
                    .catch(error => {
                        throw new InternalServerErrorException();
                    })
            }
            logging.info("cart: " + JSON.stringify(cart), "addToCart()")
            let new_list_product = [...cart.list_product];
            for (let item of new_list_product) {
                if (item.optionId == optionId) {
                    logging.info("item option exist", "addToCart()")
                    item.quantity++;
                    // console.log(JSON.stringify(new_list_product))
                    cart.list_product = new_list_product;
                    new this.cartModel(cart).save().then(rs => rs).catch(error => error)
                    logging.info("new cart: " + JSON.stringify(await cart.save().then(rs => rs).catch(error => error)), "addToCart()")
                    logging.info("END !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", "addToCart()")
                    return;
                }
            }
            logging.info("item not exist", "addToCart()")
            let cartItem: cartItem = {
                quantity: 1,
                product_id: pid,
                optionId: optionId
            }
            new_list_product = [...cart.list_product, cartItem];
            cart.list_product = new_list_product;
            logging.info("new cart: " + JSON.stringify(await cart.save().then(rs => rs).catch(error => error)), "addToCart()")
        } else {
            throw new HttpException("account not found", 404)
        }
        logging.info("END !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", "addToCart()")
    }

    async getAllCartPaging(limit: number, offset: number, req: Request) {
        let account: AccountEntity = await this.getAccount(req)
            .then(result => result)
            .catch(error => {
                throw new InternalServerErrorException();
            });
        logging.info("account: " + JSON.stringify(account), "getAllCartPaging()");
        if (account) {
            let cart: CartDocument = await this.cartModel
                .findOne({
                    account_id: account.id
                })
                .exec()
                .then(result => result)
                .catch(error => {
                    throw new InternalServerErrorException();
                });
            if (!cart) {
                logging.info("cart not exist, creat new cart", "getAllCartPaging()")
                cart = await new this.cartModel({
                    account_id: account.id,
                    list_product: []
                })
                    .save()
                    .then(rs => rs)
                    .catch(error => {
                        throw new InternalServerErrorException();
                    })
            }
            logging.info("cart: " + JSON.stringify(cart), "getAllCartPaging()")
            let list_product = cart.list_product;
            let result: any[] = new Array<any>()
            let offsetCalculated = (offset - 1) * limit
            limit = offsetCalculated + limit
            if (limit > cart.list_product.length) limit = cart.list_product.length;
            for (let i = offsetCalculated; i < limit; i++) {
                let product = await this.productService
                    .getOneProductWithCategoryWithOptProductsAllowNull(list_product[i].product_id)
                    .then(rs => rs)
                    .catch(error => {
                        throw new InternalServerErrorException();
                    })
                if (!product) {
                    this.deleteCartItemByProIdAndOptId(list_product[i].product_id, list_product[i].optionId, req);
                } else {
                    result.push({
                        quantity: list_product[i].quantity,
                        product: product,
                        chooseOption: list_product[i].optionId
                    });
                }

            }
            return result;
        } else {
            throw new HttpException("account not found", 404)

        }
    }

    async deleteCartItemByProIdAndOptId(pid: string, optionId: string, req: Request) {
        let account: AccountEntity = await this.getAccount(req)
            .then(result => result)
            .catch(error => {
                throw new InternalServerErrorException();
            });
        logging.info("account: " + JSON.stringify(account), "deleteCartItemByProId()");
        if (account) {
            let cart: CartDocument = await this.cartModel
                .findOne({
                    account_id: account.id
                })
                .exec()
                .then(result => result)
                .catch(error => {
                    throw new InternalServerErrorException();
                });
            if (!cart) {
                logging.info("cart not exist, creat new cart", "deleteCartItemByProId()")
                cart = await new this.cartModel({
                    account_id: account.id,
                    list_product: []
                })
                    .save()
                    .then(rs => rs)
                    .catch(error => {
                        throw new InternalServerErrorException();
                    })
            }
            logging.info("cart: " + JSON.stringify(cart), "deleteCartItemByProId()")
            let new_list_product = [...cart.list_product];
            new_list_product = new_list_product.filter((item) => {
                logging.info(`pid: ${pid}, optId: ${optionId}`)
                logging.info("item: " + JSON.stringify(item))
                logging.info("return: " + item.product_id !== pid && item.optionId !== optionId)
                return (item.product_id !== pid || item.optionId !== optionId)
            })
            logging.info("new list cart item: " + JSON.stringify(new_list_product))
            cart.list_product = new_list_product;
            new this.cartModel(cart).save().then(rs => rs).catch(error => error);
        } else {
            throw new HttpException("account not found", 404)

        }
    }

    async deleteAllCartItem(req: Request) {
        let account: AccountEntity = await this.getAccount(req)
            .then(result => result)
            .catch(error => {
                throw new InternalServerErrorException();
            });
        logging.info("account: " + JSON.stringify(account), "deleteCartItemByProId()");
        if (account) {
            let cart: CartDocument = await this.cartModel
                .findOne({
                    account_id: account.id
                })
                .exec()
                .then(result => result)
                .catch(error => {
                    throw new InternalServerErrorException();
                });
            if (!cart) {
                logging.info("cart not exist, creat new cart", "deleteCartItemByProId()")
                cart = await new this.cartModel({
                    account_id: account.id,
                    list_product: []
                })
                    .save()
                    .then(rs => rs)
                    .catch(error => {
                        throw new InternalServerErrorException();
                    })
            }
            logging.info("cart: " + JSON.stringify(cart), "deleteCartItemByProId()")
            let new_list_product = []
            logging.info("new list cart item: " + JSON.stringify(new_list_product))
            cart.list_product = new_list_product;
            new this.cartModel(cart).save().then(rs => rs).catch(error => error);
        } else {
            throw new HttpException("account not found", 404)

        }
    }

    async updateQuantity(pid: string, optionId: string, amount: number, req: Request): Promise<void> {
        logging.info("START !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", "addToCart()")
        logging.info("Check if product exist", "addToCart()")
        let product: ProductEntity = await this.productService.getOne(pid)
            .then(result => result)
            .catch(error => {
                logging.error(error, "addToCart()")
                throw new InternalServerErrorException();
            });
        if (!product) {
            throw new HttpException('Product is not exist', 404)
        }
        logging.info("product: " + JSON.stringify(product), "addToCart()")
        logging.info("product exist", "addToCart()")

        //
        logging.info("start extract email from token", "addToCart()")
        let email: string = await this.authService.getEmailFromToken(req?.headers?.authorization as string)
            .then(rs => rs)
            .catch(error => {
                throw new InternalServerErrorException();
            })
        logging.info("email = " + email, "addToCart()")
        logging.info("start query account by email", "addToCart()")
        let account: AccountEntity = await this.accountService.getOneWithEmail(email)
            .then(result => result)
            .catch(error => {
                throw new InternalServerErrorException();
            });
        logging.info("account: " + JSON.stringify(account), "addToCart()")
        if (account) {
            let cart: CartDocument = await this.cartModel
                .findOne({
                    account_id: account.id
                })
                .exec()
                .then(result => result)
                .catch(error => {
                    throw new InternalServerErrorException();
                });
            if (!cart) {
                cart = await new this.cartModel({
                    account_id: account.id,
                    list_product: []
                })
                    .save()
                    .then(rs => rs)
                    .catch(error => {
                        throw new InternalServerErrorException();
                    })
            }
            logging.info("cart: " + JSON.stringify(cart), "addToCart()")
            let new_list_product: cartItem[] = [...cart.list_product];
            for (let item of new_list_product) {
                if (item.product_id == pid && item.optionId == optionId) {
                    logging.info("item exist", "addToCart()")
                    item.quantity = +amount;
                    cart.list_product = new_list_product;
                    new this.cartModel(cart).save().then(rs => rs).catch(error => error)
                    logging.info("END !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", "addToCart()")
                    return;
                }
            }
        } else {
            throw new HttpException("account not found", 404)

        }
        logging.info("END !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", "addToCart()")
    }
}
