import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/base.service";
import { TransactionEntity } from "src/entities/transaction.entity";
import { Repository } from "typeorm";

@Injectable()
export class TransactionService extends BaseService<TransactionEntity> {
    constructor(
        @InjectRepository(TransactionEntity) private readonly transactionRepository: Repository<TransactionEntity>,
    ) {
        super(transactionRepository);
    }

    // get all transactions of wallet id
    async getAllTransactionOfWallet(walletId: string) {
        return await this.transactionRepository.find({
            where: {
                wallet_id: walletId
            }
        });
    }

}