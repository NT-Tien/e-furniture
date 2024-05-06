import { Body, Controller, Get, Inject, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { UserGuard } from "src/modules/auth/guards/user.guard";

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
    constructor(
        // dipose money into wallet before payment, only allow payment with wallet
        @Inject('WALLET_SERVICE_TIENNT') private readonly walletService: WalletService,
    ) { }

    // check wallet of user
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string', default: '6a1dc89b-8749-4474-a6db-04c79052a55' },
            }
        },
    })
    @ApiBearerAuth()
    @UseGuards(UserGuard)
    @Post('check')
    async check(@Body() body: { user_id: string }) {
        try {
            return await this.walletService.findWalletWithUserId(body.user_id);
        } catch (error) {
            return JSON.stringify(error);
        }
    }

    // api payment with wallet
    // api check balance of wallet
    // api get list transaction of wallet
    // api get list request withdraw of wallet
    // app deposit money into wallet
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string', default: 'c5826348-54bd-4715-8a99-fc91e57e1074' },
                amount: { type: 'number', default: 10000 },
            }
        },
    })
    @Post('deposit')
    async deposit(@Body() body: { user_id: string, amount: number }) {
        try {
            return await this.walletService.createLinkPaymentToDepositForUser(body);
        } catch (error) {
            return JSON.stringify(error);
        }
    }
    // app withdraw money from wallet
}