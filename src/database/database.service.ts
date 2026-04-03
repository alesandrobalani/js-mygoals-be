import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private dataSource: DataSource) {}

  async runMigrations(): Promise<void> {
    try {
      this.logger.log('Running pending migrations...');
      const migrations = await this.dataSource.runMigrations();
      this.logger.log(`Successfully ran ${migrations.length} migration(s)`);
    } catch (error) {
      this.logger.error('Error running migrations:', error);
      throw error;
    }
  }
}
