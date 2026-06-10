import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TransactionRepository } from '../../domain/repositories/transaction.repository';

@Injectable()
export class DeleteTransactionUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }
    await this.transactionRepository.delete(id);
  }
}
