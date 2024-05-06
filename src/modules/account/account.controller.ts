import { Body, Controller, Delete, Get, HttpException, Inject, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { AccountService } from "./account.service";
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from "@nestjs/swagger";
import { AccountEntity } from "../../entities/account.entity";
import { Role } from "src/utils/enums/role.enum";
import * as bcrypt from 'bcrypt';
import { ProfileEntity } from "src/entities/profile.entity";
import { ProfileService } from "./profile/profile.service";
import { InjectRepository } from "@nestjs/typeorm";
import { WalletEnity } from "src/entities/wallet.entity";
import { Repository } from "typeorm";
import { AdminGuard } from "../auth/guards/admin.guard";
import { UserGuard } from "../auth/guards/user.guard";
import { AuthService } from "../auth/auth.service";
import { DstaffGuard } from "../auth/guards/dstaff.guard";


type registerType = {
    email: string;
    password: string;
    username: string;
    phone: string;
}
@ApiTags('account')
@Controller('account')
export class AccountController {

    constructor(
        @Inject('ACCOUNT_SERVICE_TIENNT') private readonly accountService: AccountService,
        @Inject('AUTH_SERVICE_TIENNT') private readonly authService: AuthService,
        @Inject('PROFILE_SERVICE_TIENNT') private readonly profileService: ProfileService,
        @InjectRepository(WalletEnity) private readonly walletRepository: Repository<WalletEnity>,
    ) { }

    @ApiParam({
        name: 'size',
        type: 'number',
        description: 'number of records',
        required: false,
    })
    @ApiParam({
        name: 'page',
        type: 'number',
        description: 'page number',
        required: false,
    })
    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Get('/get-all/:size/:page')
    async getAll(
        @Param('size') size: number,
        @Param('page') page: number,
    ) {
        var limit = 100;
        var offset = 1;
        if (size > 0 && size < 100) limit = size;
        if (page > 0) offset = page;
        return await this.accountService.getAllPaging(limit, offset);
    }

    @ApiBearerAuth()
    @UseGuards(DstaffGuard)
    @Get('/:id')
    async getOne(
        @Param('id') id: string,
    ) {
        var profile = await this.profileService.getOneByAccountId(id);
        var account = await this.accountService.getOne(id);
        // hide password
        account.password = undefined;
        return { ...account, profile };
    }

    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Get('/get-one-with-email/:email')
    async getOneWithEmail(
        @Param('email') email: string,
    ) {
        return await this.accountService.getOneWithEmail(email);
    }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string' },
                password: { type: 'string' },
                role: { type: 'string', enum: Object.values(Role) },
            },
        },
    })
    @ApiBearerAuth()
    @Post('/create')
    @UseGuards(AdminGuard)
    async create(@Body() body: AccountEntity) {
        try {
            var salt = bcrypt.genSaltSync(10);
            body.password = bcrypt.hashSync(body.password, salt);
            return await this.accountService.create(body);
        } catch (error: any) {
            throw new HttpException(error.detail, 400);
        }
    }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string' },
                password: { type: 'string' },
                username: { type: 'string' },
                phone: { type: 'string' },
            },
        },
    })
    @Post('/register')
    async register(@Body() body: registerType) {
        try {
            var salt = bcrypt.genSaltSync(10);
            var account = {
                email: body.email,
                password: bcrypt.hashSync(body.password, salt),
                role: Role.user
            } as AccountEntity;
            var newAcc = await this.accountService.create(account);
            await this.walletRepository.save({
                user_id: newAcc.id,
                balance: 0
            } as WalletEnity);
            var profile = {
                user_id: newAcc.id,
                name: body.username,
                phone: body.phone
            } as ProfileEntity;
            return await this.profileService.create(profile);
        } catch (error: any) {
            throw new HttpException(error.detail, 400);
        }
    }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                password: { type: 'string' },
                new_password: { type: 'string' },
            },
        },
    })
    @ApiBearerAuth()
    @UseGuards(UserGuard)
    @Put('/update-password')
    async updatePassword(
        @Body() body: { password: string, new_password: string},
        @Req() req: any
    ) {
        // get token from header
        const accessToken = (req?.headers?.authorization as string)?.split(' ')[1];
        // verify token
        var email = await this.authService.getEmailFromToken(accessToken);
        // get account by email
        var account = await this.accountService.getOneWithEmail(email);
        // compare password
        if (!bcrypt.compareSync(body.password, account.password)) {
            throw new HttpException('Password is not correct', 400);
        }
        var salt = bcrypt.genSaltSync(10);
        body.password = bcrypt.hashSync(body.new_password, salt);
        return await this.accountService.update(account.id, { password: body.password } as AccountEntity);
    }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                role: { type: 'string', enum: Object.values(Role) },
            },
        },
    })
    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Put('/update-role/:id')
    async updateRole(
        @Param('id') id: string,
        @Body() body: { role: string },
    ) {
        return await this.accountService.update(id, { role: body.role } as AccountEntity);
    }

    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Delete('/delete/:id')
    async delete(
        @Param('id') id: string,
    ) {
        return await this.accountService.softDelete(id);
    }


}