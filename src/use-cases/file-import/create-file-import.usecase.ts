import { ConflictException, Inject, Injectable, BadRequestException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FileImport, FileImportStatus } from '../../domain/entities/file-import.entity';
import { ImportedTransaction } from '../../domain/entities/imported-transaction.entity';
import { FileImportRepository } from '../../domain/repositories/file-import.repository';
import { ImportedTransactionRepository } from '../../domain/repositories/imported-transaction.repository';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { TransactionItemRepository } from '../../domain/repositories/transaction-item.repository';
import { ClaudeFileProcessorService } from '../../infrastructure/ai/claude-file-processor.service';

export interface CreateFileImportInput {
  userId: string;
  importIdentifier: string;
  originalFileName: string;
  fileBuffer: Buffer;
  password?: string;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

@Injectable()
export class CreateFileImportUseCase {
  private readonly logger = new Logger(CreateFileImportUseCase.name);

  constructor(
    @Inject('FileImportRepository')
    private readonly fileImportRepository: FileImportRepository,
    @Inject('ImportedTransactionRepository')
    private readonly importedTransactionRepository: ImportedTransactionRepository,
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
    @Inject('TransactionItemRepository')
    private readonly transactionItemRepository: TransactionItemRepository,
    private readonly claudeService: ClaudeFileProcessorService,
  ) {}

  async execute(input: CreateFileImportInput): Promise<FileImport> {
    this.logger.log(`Iniciando importação: identifier=${input.importIdentifier}, arquivo=${input.originalFileName}`);

    const existing = await this.fileImportRepository.findByImportIdentifier(input.importIdentifier);
    if (existing) {
      throw new ConflictException(`Já existe uma importação com o identificador "${input.importIdentifier}"`);
    }

    if (input.fileBuffer.length > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('O arquivo excede o limite de 10 MB');
    }

    const fileImport = new FileImport(
      randomUUID(),
      input.userId,
      input.importIdentifier,
      input.originalFileName,
      FileImportStatus.PENDING,
      new Date(),
      new Date(),
      null,
    );

    const savedImport = await this.fileImportRepository.create(fileImport);
    this.logger.log(`Registro de importação criado: ${savedImport.id}`);

    await this.fileImportRepository.updateStatus(savedImport.id, FileImportStatus.PROCESSING);

    try {
      const [categories, transactionItems] = await Promise.all([
        this.categoryRepository.findAll(),
        this.transactionItemRepository.findAll(),
      ]);

      const extractedItems = await this.claudeService.extractTransactions(
        input.fileBuffer,
        input.originalFileName,
        input.password,
        categories.map(c => ({ id: c.id, name: c.name })),
        transactionItems.map(i => ({ id: i.id, name: i.name })),
      );

      this.logger.log(`Claude identificou ${extractedItems.length} transação(ões) para importação ${savedImport.id}`);

      if (extractedItems.length > 0) {
        const importedTransactions: ImportedTransaction[] = extractedItems.map(
          item =>
            new ImportedTransaction(
              randomUUID(),
              savedImport.id,
              item.rawText,
              item.description,
              item.amount,
              item.type,
              item.categoryId,
              item.accountId,
              item.transactionItemId,
              item.transactionDate,
              item.dueDate,
              item.settled,
              new Date(),
              new Date(),
            ),
        );

        await this.importedTransactionRepository.createMany(importedTransactions);
        this.logger.log(`Salvas ${importedTransactions.length} transações importadas para importação ${savedImport.id}`);
      }

      return this.fileImportRepository.updateStatus(savedImport.id, FileImportStatus.COMPLETED);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Falha na importação ${savedImport.id}: ${errorMessage}`);
      await this.fileImportRepository.updateStatus(savedImport.id, FileImportStatus.FAILED, errorMessage);
      throw error;
    }
  }
}
