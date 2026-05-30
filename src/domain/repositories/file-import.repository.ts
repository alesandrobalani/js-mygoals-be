import { FileImport, FileImportStatus } from '../entities/file-import.entity';

export interface FileImportRepository {
  create(fileImport: FileImport): Promise<FileImport>;
  findById(id: string): Promise<FileImport | null>;
  findByImportIdentifier(importIdentifier: string): Promise<FileImport | null>;
  updateStatus(id: string, status: FileImportStatus, errorMessage?: string | null): Promise<FileImport>;
}
