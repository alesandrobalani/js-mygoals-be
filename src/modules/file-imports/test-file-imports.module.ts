import { Module } from '@nestjs/common';
import { SqliteDatabaseModule } from '../../test-utils/sqlite-database.module';
import { FileImportsController } from './file-imports.controller';
import { CreateFileImportUseCase } from '../../use-cases/file-import/create-file-import.usecase';
import { ClaudeFileProcessorService } from '../../infrastructure/ai/claude-file-processor.service';

@Module({
  imports: [SqliteDatabaseModule],
  controllers: [FileImportsController],
  providers: [CreateFileImportUseCase, ClaudeFileProcessorService],
})
export class TestFileImportsModule {}
