import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Logger, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/strategies/jwt.strategy';
import { UserRole } from '../../domain/entities/user.entity';
import { CreateFileImportDto } from '../../dto/create-file-import.dto';
import { CreateFileImportUseCase } from '../../use-cases/file-import/create-file-import.usecase';

const ALLOWED_EXTENSIONS = /\.(csv|xls|xlsx|pdf)$/i;

@Roles(UserRole.USER)
@Controller('file-imports')
export class FileImportsController {
  private readonly logger = new Logger(FileImportsController.name);

  constructor(private readonly createFileImport: CreateFileImportUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_EXTENSIONS.test(file.originalname)) {
          return cb(new BadRequestException('Somente arquivos .csv, .xls, .xlsx e .pdf são permitidos'), false);
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() payload: CreateFileImportDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) {
      throw new BadRequestException('O arquivo é obrigatório');
    }

    this.logger.log(
      `POST /file-imports - user=${user.userId}, identifier=${payload.importIdentifier}, arquivo=${file.originalname}`,
    );

    try {
      const result = await this.createFileImport.execute({
        userId: user.userId,
        importIdentifier: payload.importIdentifier,
        originalFileName: file.originalname,
        fileBuffer: file.buffer,
        password: payload.password,
      });

      this.logger.log(`Importação concluída: id=${result.id}, status=${result.status}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Falha na importação: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
