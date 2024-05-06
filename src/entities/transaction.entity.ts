import { Expose } from "class-transformer";
import { IsNotEmpty } from "class-validator";
import { BaseEntity } from "src/common/base.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { WalletEnity } from "./wallet.entity";

export type TransactionType = 'deposit' | 'withdraw' | 'payment';

@Entity('TRANSACTION')
export class TransactionEntity extends BaseEntity {
    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        name: 'wallet_id'
    })
    @ManyToOne(() => WalletEnity, wallet => wallet.id)
    @IsNotEmpty()
    @Expose()
    wallet_id: string;

    @Column({
        type: 'numeric',
        nullable: false,
        name: 'amount'
    })
    @IsNotEmpty()
    @Expose()
    amount: number;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        name: 'type'
    })
    @IsNotEmpty()
    @Expose()
    type: TransactionType;

    @Column({
        type: 'numeric',
        nullable: true,
        name: 'fee'
    })
    @Expose()
    fee: number;

}