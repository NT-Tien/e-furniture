import { HttpException, Inject, Injectable } from "@nestjs/common";
import { BaseService } from "src/common/base.service";
import { AccountEntity } from "../../entities/account.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { ProfileService } from "./profile/profile.service";

@Injectable()
export class AccountService extends BaseService<AccountEntity> {
    constructor(
        @InjectRepository(AccountEntity) private accountRepository: Repository<AccountEntity>,
        @Inject('PROFILE_SERVICE_TIENNT') private readonly profileService: ProfileService,
    ) {
        super(accountRepository);
    }

    async getAllPaging(limit: number, offset: number): Promise<[AccountEntity[], number]> {
        return await this.accountRepository
            .createQueryBuilder("ACCOUNT")
            .where("ACCOUNT.deletedAt is null")
            .skip((offset - 1) * limit)
            .take(limit)
            .getManyAndCount();
    }

    async getOneWithEmail(email: string): Promise<AccountEntity> {
        var result = await this.accountRepository
            .createQueryBuilder("ACCOUNT")
            .where("ACCOUNT.email = :email", { email: email })
            .getOne();
        if (!result) {
            throw new HttpException("Account not found", 404);
        }
        return { ...result, id: result.id } as AccountEntity;
    }

    async login(email: string, password: string): Promise<AccountEntity> {
        var result = await this.accountRepository
            .createQueryBuilder("ACCOUNT")
            .where("ACCOUNT.email = :email", { email: email })
            .getOne();
        if (result) {
            if (bcrypt.compareSync(password, result.password)) {
                return result;
            }
        }
        return null;
    }

    async softDelete(id: string): Promise<AccountEntity> {
        const user = await this.accountRepository.findOne({ where: { id: id, } });
        if (user) {
            user.email += "-deleted-" + user.id;
            user.deletedAt = new Date();
            return await this.accountRepository.save(user);
        }
        throw new HttpException("Account not found", 404);
    }

    async getProfile(id: string): Promise<any> {
        var user = await this.accountRepository.findOne({ where: { id: id } });
        var profile = await this.profileService.getOneByAccountId(user.id);
        return {
            user: AccountEntity.plainToClass(user),
            profile: profile
        }
    }

}