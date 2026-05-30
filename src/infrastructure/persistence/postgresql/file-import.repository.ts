import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileImport, FileImportStatus } from '../../../domain/entities/file-import.entity';
import { FileImportRepository } from '../../../domain/repositories/file-import.repository';
import { FileImportEntity } from './file-import.entity';

@Injectable()
export class PostgreSQLFileImportRepository implements FileImportRepository {
  constructor(
    @InjectRepository(FileImportEntity)
    private readonly repo: Repository<FileImportEntity>,
  ) {}

  private toEntity(fi: FileImport): FileImportEntity {
    const e = new FileImportEntity();
    e.id = fi.id;
    e.userId = fi.userId;
    e.importIdentifier = fi.importIdentifier;
    e.originalFileName = fi.originalFileName;
    e.status = fi.status;
    e.errorMessage = fi.errorMessage ?? null;
    return e;
  }

  private toDomain(e: FileImportEntity): FileImport {
    return new FileImport(
      e.id,
      e.userId,
      e.importIdentifier,
      e.originalFileName,
      e.status,
      e.createdAt,
      e.updatedAt,
      e.errorMessage,
    );
  }

  async create(fileImport: FileImport): Promise<FileImport> {
    const saved = await this.repo.save(this.toEntity(fileImport));
    const loaded = await this.repo.findOneOrFail({ where: { id: saved.id } });
    return this.toDomain(loaded);
  }

  async findById(id: string): Promise<FileImport | null> {
    const e = await this.repo.findOne({ where: { id } });
    return e ? this.toDomain(e) : null;
  }

  async findByImportIdentifier(importIdentifier: string): Promise<FileImport | null> {
    const e = await this.repo.findOne({ where: { importIdentifier } });
    return e ? this.toDomain(e) : null;
  }

  async updateStatus(id: string, status: FileImportStatus, errorMessage?: string | null): Promise<FileImport> {
    await this.repo.update(id, { status, errorMessage: errorMessage ?? null });
    const updated = await this.repo.findOneOrFail({ where: { id } });
    return this.toDomain(updated);
  }
}
