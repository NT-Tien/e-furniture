import { Expose } from "class-transformer";
import { IsNotEmpty } from "class-validator";
import { BaseEntity } from "src/common/base.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { ProductEntity } from "./product.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity('OPTION_PRODUCT')
export class OptionProductEntity extends BaseEntity {

    @ManyToOne(() => ProductEntity, product => product.id)
    product_id: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        name: 'NAME'
    })
    @IsNotEmpty()
    @Expose()
    name: string;

    @Column({
        type: 'varchar',
        nullable: false,
        name: 'MATERIAL'
    })
    @IsNotEmpty()
    @Expose()
    material: string;

    @Column({
        type: 'numeric',
        nullable: false,
        name: 'PRICE'
    })
    @IsNotEmpty()
    @Expose()
    price: number;

    @Column({
        type: 'int',
        nullable: false,
        name: 'QUANTITY'
    })
    @IsNotEmpty()
    @Expose()
    quantity: number;
}