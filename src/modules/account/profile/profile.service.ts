import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/base.service";
import { ProfileEntity } from "src/entities/profile.entity";
import { Repository } from "typeorm";

@Injectable()
export class ProfileService extends BaseService<ProfileEntity> {
    constructor(
        @InjectRepository(ProfileEntity) private readonly profileRepository: Repository<ProfileEntity>
    ) {
        super(profileRepository);
    }

    async getOneByAccountId(accountId: string): Promise<ProfileEntity> {
        var profile = await this.profileRepository.findOne({ where: { user_id: accountId } });
        if(!profile) {
            return null;
        }
        return profile;
    }
}