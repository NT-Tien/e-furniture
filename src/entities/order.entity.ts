import { Column, Entity, ManyToOne, W } from "typeorm";
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsUUID, Length, NotContains } from "class-validator";
import { Expose } from "class-transformer";
import { BaseEntity } from "src/common/base.entity";
import { AccountEntity } from "./account.entity";
import { OptionProductEntity } from "./option.product.entity";
import { ApiProperty } from "@nestjs/swagger";


export type WalletPayment = {
    wallet_id: string,
    total: number,
}
export enum statusDelivery {
    PENDING = 'PENDING',
    SHIPPING = 'SHIPPING',
    DELIVERED = 'DELIVERED',
    CANCELED = 'CANCELED'
}

@Entity('ORDER')
export class OrderEntity extends BaseEntity {

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        name: 'user_id'
    })
    @ManyToOne(() => AccountEntity, user => user.id)
    @IsNotEmpty()
    @Expose()
    @IsUUID()
    @ApiProperty()
    user_id: string;

    @Column({
        type: 'numeric',
        nullable: false,
        name: 'total'
    })
    @IsNotEmpty()
    @Expose()
    total: number;

    @Column({
        type: 'jsonb',
        nullable: false,
        name: 'products'
    })
    @IsNotEmpty()
    @Expose()
    products: OptionProductEntity[];

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
        name: 'voucher_id'
    })
    @Expose()
    // @IsUUID()
    voucher_id: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        name: 'address'
    })
    @IsNotEmpty()
    @Expose()
    @Length(10, 255)
    address: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        name: 'phone'
    })
    @IsPhoneNumber('VN')
    @IsNotEmpty()
    @Expose()
    phone: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        name: 'email'
    })
    @IsEmail()
    @IsNotEmpty()
    @Expose()
    @Length(10, 255)
    email: string;

    @Column({
        type: 'jsonb',
        nullable: true,
        name: 'payment'
    })
    @Expose()
    payment: any;

    @Column({
        type: 'jsonb',
        nullable: true,
        name: 'wallet_payment'
    })
    @Expose()
    wallet_payment: WalletPayment;

    @Column({
        type: 'enum',
        enum: statusDelivery,
        default: statusDelivery.PENDING,
        nullable: false,
        name: 'status_delivery'
    })
    @Expose()
    status_delivery: statusDelivery;

}