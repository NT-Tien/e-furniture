import { Expose } from "class-transformer";
import { IsNotEmpty } from "class-validator";
import { BaseEntity } from "src/common/base.entity";
import { Column, Entity, ManyToOne, OneToMany, Unique } from "typeorm";
import { CategoryEntity } from "./category.entity";
import { OptionProductEntity } from "./option.product.entity";

@Entity('PRODUCT')
@Unique(['name'])
export class ProductEntity extends BaseEntity {

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
        array: true,
        nullable: false,
        name: 'IMAGES'
    })
    @IsNotEmpty()
    @Expose()
    images: string[];

    @Column({
        type: 'varchar',
        nullable: false,
        name: 'DESCRIPTION'
    })
    @IsNotEmpty()
    @Expose()
    description: string;

    // reference to category table - category id
    @ManyToOne(() => CategoryEntity, category => category.id)
    @IsNotEmpty()
    @Expose()
    category_id: string;

    // reference to option product table
    @OneToMany(() => OptionProductEntity, optionProduct => optionProduct.product_id)
    @Expose()
    optionProducts: OptionProductEntity[];
}