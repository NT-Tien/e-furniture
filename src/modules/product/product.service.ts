import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/base.service";
import { ProductEntity } from "src/entities/product.entity";
import { Repository } from "typeorm";
import { isUUID } from 'class-validator';
import logging from "src/config/logging";
@Injectable()
export class ProductService extends BaseService<ProductEntity> {
    constructor(
        @InjectRepository(ProductEntity) private productRepository: Repository<ProductEntity>,
    ) {
        super(productRepository);
    }

    async getAllPaging(limit: number, offset: number, filter: FilterObject): Promise<[ProductEntity[], number]> {
        logging.info(JSON.stringify(filter))
        return await this.productRepository
            .createQueryBuilder("PRODUCT")
            .leftJoinAndSelect('PRODUCT.category_id', 'category_id')
            .leftJoinAndSelect('PRODUCT.optionProducts', 'optionProducts')
            .where(`PRODUCT.deletedAt is null AND PRODUCT.NAME LIKE :productName AND cast(PRODUCT.categoryIdId as text) LIKE :categoryId`, {
                productName: `%${filter.query}%`,
                categoryId: `%${filter.categoryId}%`,
            })
            .orderBy({ [`PRODUCT.${filter.sortBy}`]: filter.direction })
            .skip((offset - 1) * limit)
            .take(limit)
            .getManyAndCount();
    }

    async getAllPagingDeleted(limit: number, offset: number): Promise<[ProductEntity[], number]> {
        return await this.productRepository
            .createQueryBuilder("PRODUCT")
            .leftJoinAndSelect('PRODUCT.category_id', 'category_id')
            .where("PRODUCT.deletedAt is not null")
            .skip((offset - 1) * limit)
            .take(limit)
            .getManyAndCount();
    }

    async getPorudctByName(name: string): Promise<ProductEntity> {
        return await this.productRepository
            .createQueryBuilder("PRODUCT")
            .leftJoinAndSelect('PRODUCT.optionProducts', 'optionProducts')
            .where(`PRODUCT.name = :name`, { name: name })
            .getOne();
    }

    async getOneProductWithCategoryWithOptProducts(id: string): Promise<ProductEntity> {
        // check id is uuid
        if (!isUUID(id)) {
            throw new HttpException('Id is incorrect', HttpStatus.BAD_REQUEST);
        }
        var result = await this.productRepository
            .createQueryBuilder("PRODUCT")
            .leftJoinAndSelect('PRODUCT.category_id', 'category_id')
            .leftJoinAndSelect('PRODUCT.optionProducts', 'optionProducts')
            .where(`PRODUCT.id = :id`, { id: id })
            .getOne();
        if (!result) {
            throw new HttpException('Product is not exist', HttpStatus.BAD_REQUEST);
        }
        return result;
    }

    async getOneProductWithCategoryWithOptProductsAllowNull(id: string): Promise<ProductEntity> {
        // check id is uuid
        if (!isUUID(id)) {
            throw new HttpException('Id is incorrect', HttpStatus.BAD_REQUEST);
        }
        var result = await this.productRepository
            .createQueryBuilder("PRODUCT")
            .leftJoinAndSelect('PRODUCT.category_id', 'category_id')
            .leftJoinAndSelect('PRODUCT.optionProducts', 'optionProducts')
            .where(`PRODUCT.id = :id`, { id: id })
            .getOne();
        return result;
    }

    async softDelete(id: string): Promise<any> {
        var result = await this.productRepository.update(id, { deletedAt: new Date() });
        return result;
    }

}

export interface FilterObject {
    query: string,
    categoryId: string,
    sortBy: string,
    direction: "ASC" | "DESC"
} 