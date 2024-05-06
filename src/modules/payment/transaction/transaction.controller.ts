import { Controller, Get, Inject, Param, UseGuards } from "@nestjs/common";
import { TransactionService } from "./transaction.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AdminGuard } from "src/modules/auth/guards/admin.guard";

@ApiTags('transaction')
@Controller('transaction')
export class TransactionController {
    constructor(
        @Inject('TRANSACTION_SERVICE_TIENNT') private readonly transactionService: TransactionService,
    ) { }

    // get all transactions in system
    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Get('/get-all')
    async getAll() {
        return await this.transactionService.getAll();
    }
    // get one transactions of wallet id
    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Get('/:wallet-id')
    async getOne(
        @Param('wallet-id') id: string,
    ) {
        return await this.transactionService.getAllTransactionOfWallet(id);
    }


}