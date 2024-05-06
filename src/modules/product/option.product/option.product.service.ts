import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isUUID } from "class-validator";
import { BaseService } from "src/common/base.service";
import { OptionProductEntity } from "src/entities/option.product.entity";
import { Repository } from "typeorm";

@Injectable()
export class OptionProductService extends BaseService<OptionProductEntity> {
    constructor(
        @InjectRepository(OptionProductEntity) private optionProductRepository: Repository<OptionProductEntity>,

    ) {
        super(optionProductRepository);
    }

    // get all option product of product by product id
    async getAllOptionProductByProductId(productId: string): Promise<OptionProductEntity[]> {
        if (!isUUID(productId)) {
            throw new HttpException('Id is incorrect', 400);
        }
        return this.optionProductRepository
            .createQueryBuilder("OPTION_PRODUCT")
            .where(`OPTION_PRODUCT.product_id = :productId`, { productId: productId })
            .getMany();
    }
    // check if product is exist and enough quantity and correct price
    async checkProductIsExistAndEnoughQuantityAndPrice(id: string, quantity: number, price: number, name: string): Promise<boolean> {
        if (!isUUID(id)) {
            throw new HttpException('Id is incorrect', 400);
        }
        const product = await this.optionProductRepository
            .createQueryBuilder("OPTION_PRODUCT")
            .where(`OPTION_PRODUCT.id = :id`, { id: id })
            .andWhere(`OPTION_PRODUCT.deletedAt is null`)
            .getOne();
        if (!product) {
            throw new HttpException('Product is not exist', 404);
        }
        if (product.quantity < quantity) {
            throw new HttpException('Product is not enough quantity', 400);
        }
        if (product.price != price) {
            throw new HttpException('Product is not correct price', 400);
        }
        if (product.name != name) {
            throw new HttpException('Product is not correct name', 400);
        }
        return true;
    }
    // decrease quantity of product after order
    async decreaseQuantityOfProduct(id: string, quantity: number): Promise<boolean> {

        const product = await this.optionProductRepository
            .createQueryBuilder("OPTION_PRODUCT")
            .where(`OPTION_PRODUCT.id = :id`, { id: id })
            .getOne();
        if (!product) {
            return false;
        }
        product.quantity = parseInt(product.quantity.toString()) - parseInt(quantity.toString());
        await this.optionProductRepository.update(id, { quantity: product.quantity });
        return true;
    }
    // increase quantity of product after cancel order
    async increaseQuantityOfProduct(id: string, quantity: number): Promise<boolean> {
        const product = await this.optionProductRepository
            .createQueryBuilder("OPTION_PRODUCT")
            .where(`OPTION_PRODUCT.id = :id`, { id: id })
            .getOne();
        if (!product) {
            return false;
        }
        product.quantity = parseInt(product.quantity.toString()) + parseInt(quantity.toString());
        await this.optionProductRepository.update(id, { quantity: product.quantity });
        return true;
    }
    // soft delete option product
    async softDelete(id: string): Promise<boolean> {
        const optionProduct = await this.optionProductRepository
            .createQueryBuilder("OPTION_PRODUCT")
            .where(`OPTION_PRODUCT.id = :id`, { id: id })
            .getOne();
        if (!optionProduct) {
            return false;
        }
        optionProduct.deletedAt = new Date();
        await this.optionProductRepository.save(optionProduct);
        return true;
    }

    // create many option products
    async createManyOptionProducts(optionProducts: OptionProductEntity[]): Promise<OptionProductEntity[]> {
        return await this.optionProductRepository.save(optionProducts);
    }

    // hard delete many option products
    async deleteManyOptionProducts(optionProducts: string[]): Promise<boolean>{
        for (let i = 0; i < optionProducts.length; i++) {
            if (!isUUID(optionProducts[i])) {
                throw new HttpException('Id is incorrect', 400);
            }
            if (!await this.getOne(optionProducts[i])) {
                throw new HttpException('Id is not exist', 400);
            }
            await this.optionProductRepository.delete(optionProducts[i]);
        }
        return true;
    }

}