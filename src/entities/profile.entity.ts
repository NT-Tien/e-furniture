import { Expose } from "class-transformer";
import { IsNotEmpty, IsPhoneNumber } from "class-validator";
import { BaseEntity } from "src/common/base.entity";
import { Column, Entity, OneToOne } from "typeorm";
import { AccountEntity } from "./account.entity";

@Entity('PROFILE')
export class ProfileEntity extends BaseEntity {
    
    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        name: 'user_id'
    })
    @OneToOne(() => AccountEntity, account => account.id)
    @IsNotEmpty()
    @Expose()
    user_id: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        name: 'name'
    })
    @IsNotEmpty()
    @Expose()
    name: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        name: 'phone'
    })
    @IsNotEmpty()
    @Expose()
    @IsPhoneNumber('VN')
    phone: string;
}