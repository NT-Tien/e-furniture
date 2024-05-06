import { Expose } from "class-transformer";
import { IsNotEmpty } from "class-validator";
import { BaseEntity } from "src/common/base.entity";
import { Column, Entity, OneToMany, Unique } from "typeorm";
import { ProductEntity } from "./product.entity";

@Entity('CATEGORY')
@Unique(['name'])
export class CategoryEntity extends BaseEntity {
    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        name: 'NAME'
    })
    @IsNotEmpty()
    @Expose()
    name: string;
}