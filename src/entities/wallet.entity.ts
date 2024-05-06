import { BaseEntity } from "src/common/base.entity";
import { Column, Entity, OneToOne } from "typeorm";
import { IsNotEmpty } from "class-validator";
import { Expose } from "class-transformer";
import { AccountEntity } from "./account.entity";

@Entity('WALLET')
export class WalletEnity extends BaseEntity {

    @Column({
        type: 'uuid',
        nullable: false,
        name: 'user_id'
    })
    @OneToOne(() => AccountEntity, account => account.id)
    @IsNotEmpty()
    @Expose()
    user_id: string;

    @Column({
        type: 'numeric',
        nullable: false,
        name: 'balance'
    })
    @IsNotEmpty()
    @Expose()
    balance: number;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
        name: 'bank_name'
    })
    @IsNotEmpty()
    @Expose()
    bank_name: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
        name: 'account_number'
    })
    @IsNotEmpty()
    @Expose()
    account_number: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
        name: 'account_name'
    })
    @IsNotEmpty()
    @Expose()
    account_name: string;

}