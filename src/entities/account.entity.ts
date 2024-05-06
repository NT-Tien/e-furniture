import { Exclude, Expose } from "class-transformer";
import { IsNotEmpty } from "class-validator";
import { BaseEntity } from "src/common/base.entity";
import { Role } from "src/utils/enums/role.enum";
import { Column, Entity, Unique } from "typeorm";

@Unique(["email"])
@Entity({
    name: "ACCOUNT",
})
export class AccountEntity extends BaseEntity {
    
    @Column({
        name: "Email",
        type: "varchar",
        length: 100,
        nullable: false,
    })
    @IsNotEmpty()
    @Expose()
    email: string;

    @Column({
        name: "Password",
        type: "varchar",
        length: 100,
        nullable: false,
    })
    @IsNotEmpty()
    password: string;

    @Column({
        name: "Role",
        type: "enum",
        enum: Role,
        nullable: false,
    })
    @IsNotEmpty()
    @Expose()
    role: Role;
    
}