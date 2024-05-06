import { Expose } from "class-transformer";
import { IsNotEmpty } from "class-validator";
import { BaseEntity } from "src/common/base.entity";
import { Column, Entity, OneToOne } from "typeorm";
import { AccountEntity } from "./account.entity";

@Entity('OrderDesign')
export class OrderDesignEntity extends BaseEntity {
    
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
        name: 'file'
    })
    @IsNotEmpty()
    @Expose()
    file: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        name: 'username'
    })
    username: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        name: 'phone'
    })
    @IsNotEmpty()
    @Expose()
    phone: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        name: 'address'
    })
    @IsNotEmpty()
    @Expose()
    address: string;

    @Column({
        type: 'numeric',
        nullable: true,
        name: 'set_price'
    })
    @Expose()
    set_price: number; // only staff can set it after check the address

    @Column({
        type: 'boolean',
        nullable: true,
        name: 'isMailed'
    })
    @Expose()
    isMailed: boolean;

    @Column({
        type: 'boolean',
        nullable: true,
        name: 'isPaid'
    })
    @Expose()
    isPaid: boolean;

    @Column({
        type: 'boolean',
        nullable: true,
        name: 'isDenied'
    })
    @Expose()
    isDenied: boolean;
}