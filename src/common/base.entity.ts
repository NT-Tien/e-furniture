import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { plainToClass } from "class-transformer";
import { BeforeUpdate, Column, PrimaryGeneratedColumn } from "typeorm";

export abstract class BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        name: "createdAt",
        type: "timestamp",
        nullable: false,
        default: () => "CURRENT_TIMESTAMP",
    })
    createdAt: Date;

    @Column({
        name: "updatedAt",
        type: "timestamp",
        nullable: false,
        default: () => "CURRENT_TIMESTAMP",
    })
    updatedAt: Date;

    @Column({
        name: "deletedAt",
        type: "timestamp",
        nullable: true,
    })
    deletedAt: Date;

    // explain: run transform plain to class
    // validate before update 
    static plainToClass<T>(this: new (...args: any[]) => T, plain: T): T {
        return plainToClass(this, plain, { excludeExtraneousValues: true });
    }

    @BeforeUpdate()
    beforeUpdate() {
        // Chặn cập nhật trường primary key
        if (this.id !== this.id) {
            throw new Error('Cannot update primary key (id)');
        }
    }
}