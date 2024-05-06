import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/base.service";
import { CategoryEntity } from "src/entities/category.entity";
import { Repository } from "typeorm";

@Injectable()
export class CategoryService extends BaseService<CategoryEntity> {
    constructor(
        @InjectRepository(CategoryEntity) private categoryRepository: Repository<CategoryEntity>
    ) {
        super(categoryRepository);
    }

    async getAllWithoutDeleted() {
        return this.categoryRepository
            .createQueryBuilder("CATEGORY")
            .where("CATEGORY.deletedAt is null")
            .getManyAndCount();
    }

    async getAllDeleted() {
        return this.categoryRepository
            .createQueryBuilder("CATEGORY")
            .where("CATEGORY.deletedAt is not null")
            .getManyAndCount();
    }

    // soft delete
    async softDelete(id: string) {
        return this.categoryRepository.update(id, { deletedAt: new Date() })
    }

    // restore category
    async restore(id: string) {
        return this.categoryRepository.update(id, { deletedAt: null })
    }
}