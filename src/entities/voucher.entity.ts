import { Expose } from "class-transformer";
import { IsNotEmpty, Max, Min } from "class-validator";
import { BaseEntity } from "src/common/base.entity";
import { Column, Entity, Unique } from "typeorm";

// voucher allow update only expired date and amount
@Unique(['code'])
@Entity('VOUCHER')
export class VoucherEntity extends BaseEntity {
    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        name: 'code'
    })
    @IsNotEmpty()
    @Expose()
    code: string;

    @Column({
        type: 'numeric',
        nullable: false,
        name: 'amount'
    })
    @IsNotEmpty()
    @Expose()
    amount: number;

    @Column({
        type: 'timestamp',
        nullable: false,
        name: 'expired_date'
    })
    @IsNotEmpty()
    @Expose()
    expired_date: Date;

    @Column({
        type: 'numeric',
        nullable: false,
        name: 'discount_percent',
    })
    @IsNotEmpty()
    @Expose()
    @Max(100)
    @Min(0)
    discount_percent: number;

    @Column({
        type: 'numeric',
        nullable: false,
        name: 'limit_discount_max',
    })
    @IsNotEmpty()
    @Expose()
    limit_total_max: number;

    @Column({
        type: 'numeric',
        nullable: false,
        name: 'limit_total_min',
    })
    @IsNotEmpty()
    @Expose()
    limit_total_min: number;

}