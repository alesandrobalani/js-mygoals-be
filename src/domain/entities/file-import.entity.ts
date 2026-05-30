export enum FileImportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class FileImport {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly importIdentifier: string,
    readonly originalFileName: string,
    readonly status: FileImportStatus,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly errorMessage?: string | null,
  ) {}
}
