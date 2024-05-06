import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/base.service";
import { ProductEntity } from "src/entities/product.entity";
import { Repository } from "typeorm";
import { isUUID } from 'class-validator';
import logging from "src/config/logging";
import { RateEntity } from "src/entities/rate.entity";
@Injectable()
export class RateService extends BaseService<RateEntity> {
    constructor(
        @InjectRepository(RateEntity) private rateRepository: Repository<RateEntity>,
    ) {
        super(rateRepository);
    }

    // get all rates with product id
    async getAllRate(productId: string) {
        if (!isUUID(productId)) {
            throw new HttpException('Invalid product id', HttpStatus.BAD_REQUEST);
        }
        const rates = await this.rateRepository.find({ where: { product_id: productId } });
        if (rates.length === 0) {
            throw new HttpException('No rate found', HttpStatus.NOT_FOUND);
        }
        return rates;
    }

    // get abs rate and number of rates
    async getAbsRate(productId: string) {
        if (!isUUID(productId)) {
            throw new HttpException('Invalid product id', HttpStatus.BAD_REQUEST);
        }
        const rates = await this.rateRepository.find({ where: { product_id: productId } });
        if (rates.length === 0) {
            throw new HttpException('No rate found', HttpStatus.NOT_FOUND);
        }
        let absRate = 0;
        for (let rate of rates) {
            absRate += rate.rate;
        }
        return { absRate, numberOfRates: rates.length };
    }

    // status of rate with list product id
    async getStatusRate(userId: string) {
        if (!isUUID(userId)) {
            throw new HttpException('Invalid user id', HttpStatus.BAD_REQUEST);
        }
        const rates = await this.rateRepository.find({ where: { user_id: userId } });
        if (rates.length === 0) {
            throw new HttpException('No rate found', HttpStatus.NOT_FOUND);
        }
        return rates;
    }

    // rate with user_id and product_id
    async rating(user_id: string, product_id: string, rate: number ) {
        if (!isUUID(user_id) || !isUUID(product_id)) {
            throw new HttpException('Invalid user id or product id', HttpStatus.BAD_REQUEST);
        }
        const rateEntity = await this.rateRepository.findOne({ where: { user_id, product_id } });
        if (!rateEntity) {
            // create new rate
            this.rateRepository.save({ user_id, product_id, rate });
            return null;
        } else {
            // update rate
            rateEntity.rate = rate;
            this.rateRepository.save(rateEntity);
        }
        return rateEntity;
    }
}