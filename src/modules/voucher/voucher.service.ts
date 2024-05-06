import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/base.service";
import { VoucherEntity } from "src/entities/voucher.entity";
import { Repository } from "typeorm";

@Injectable()
export class VoucherService extends BaseService<VoucherEntity> {
    constructor(
        @InjectRepository(VoucherEntity) private readonly repositoryVoucher: Repository<VoucherEntity>,
    ) {
        super(repositoryVoucher);
    }

    async getOneWithCode(code: string): Promise<VoucherEntity> {
        return await this.repositoryVoucher.findOne({ where: { code: code } });
    }

    async checkVoucherIsExistAndNotExpired(id: string): Promise<VoucherEntity> {
        const voucher = await this.getOne(id); 
        console.log(voucher);
        
        if (!voucher) {
            throw new Error('Voucher is not exist');
        }
        if (voucher.expired_date < new Date()) {
            throw new Error('Voucher is expired');
        }
        return voucher;
    }

    async discountVoucher(voucher: VoucherEntity, total: number): Promise<number> {
        if (voucher.limit_total_max && total > voucher.limit_total_max) {
            throw new Error('Total is over limit');
        }
        if (voucher.limit_total_min && total < voucher.limit_total_min) {
            throw new Error('Total is under limit');
        }
        return total - (total * voucher.discount_percent / 100);
    }

}