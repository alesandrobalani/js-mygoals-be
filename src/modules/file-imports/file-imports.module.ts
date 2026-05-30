import { Module } from '@nestjs/common';
import { FileImportsController } from './file-imports.controller';
import { CreateFileImportUseCase } from '../../use-cases/file-import/create-file-import.usecase';
import { ClaudeFileProcessorService } from '../../infrastructure/ai/claude-file-processor.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [FileImportsController],
  providers: [CreateFileImportUseCase, ClaudeFileProcessorService],
})
export class FileImportsModule {}
