import { Expose } from "class-transformer";
import { IsNotEmpty, Max, Min } from "class-validator";
import { BaseEntity } from "src/common/base.entity";
import { Column, Entity } from "typeorm";

@Entity('RATE')
export class RateEntity extends BaseEntity {

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        name: 'user_id'
    })
    @IsNotEmpty()   
    @Expose()
    user_id: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        name: 'product_id'
    })
    @IsNotEmpty()
    @Expose()
    product_id: string;

    @Column({
        type: 'int',
        nullable: true,
        name: 'rate'
    })
    @IsNotEmpty()
    @Expose()
    @Max(5)
    @Min(1)
    rate: number;

}