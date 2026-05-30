import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import * as XLSX from 'xlsx';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse: (buffer: Buffer, options?: Record<string, unknown>) => Promise<{ text: string }> = require('pdf-parse');
import { TransactionType } from '../../dto/create-transaction.dto';

export interface ExtractedTransaction {
  rawText: string;
  description: string | null;
  amount: number | null;
  type: TransactionType | null;
  categoryId: string | null;
  accountId: string | null;
  transactionItemId: string | null;
  transactionDate: Date | null;
  dueDate: Date | null;
  settled: boolean | null;
}

export interface ContextItem {
  id: string;
  name: string;
}

@Injectable()
export class ClaudeFileProcessorService {
  private readonly logger = new Logger(ClaudeFileProcessorService.name);
  private readonly anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async extractTransactions(
    fileBuffer: Buffer,
    originalFileName: string,
    password?: string,
    categories: ContextItem[] = [],
    transactionItems: ContextItem[] = [],
  ): Promise<ExtractedTransaction[]> {
    const ext = originalFileName.split('.').pop()?.toLowerCase();
    let textContent: string;

    if (ext === 'csv') {
      textContent = fileBuffer.toString('utf-8');
    } else if (ext === 'xlsx' || ext === 'xls') {
      textContent = this.extractExcelText(fileBuffer, password);
    } else if (ext === 'pdf') {
      textContent = await this.extractPdfText(fileBuffer, password);
    } else {
      throw new BadRequestException(`Tipo de arquivo não suportado: .${ext}. Tipos aceitos: csv, xlsx, xls, pdf`);
    }

    return this.callClaude(textContent, categories, transactionItems);
  }

  private extractExcelText(buffer: Buffer, password?: string): string {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer', password, cellDates: true });
      const lines: string[] = [];
      for (const sheetName of workbook.SheetNames) {
        lines.push(`=== Planilha: ${sheetName} ===`);
        lines.push(XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]));
      }
      return lines.join('\n');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('protected')) {
        throw new BadRequestException('Arquivo Excel protegido por senha. Informe a senha correta.');
      }
      throw new InternalServerErrorException(`Falha ao processar arquivo Excel: ${msg}`);
    }
  }

  private async extractPdfText(buffer: Buffer, password?: string): Promise<string> {
    try {
      const options: Record<string, unknown> = {};
      if (password) options['password'] = password;
      const data = await pdfParse(buffer, options);
      return data.text;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('encrypted')) {
        throw new BadRequestException('Arquivo PDF protegido por senha. Informe a senha correta.');
      }
      throw new InternalServerErrorException(`Falha ao processar arquivo PDF: ${msg}`);
    }
  }

  private async callClaude(
    textContent: string,
    categories: ContextItem[],
    transactionItems: ContextItem[],
  ): Promise<ExtractedTransaction[]> {
    this.logger.debug(`Enviando conteúdo para Claude (${textContent.length} caracteres)`);

    const categoriesContext =
      categories.length > 0
        ? `\nCategorias disponíveis no sistema:\n${categories.map(c => `- ID: ${c.id}, Nome: "${c.name}"`).join('\n')}`
        : '\nNenhuma categoria cadastrada no sistema.';

    const transactionItemsContext =
      transactionItems.length > 0
        ? `\nItens de transação disponíveis no sistema:\n${transactionItems.map(i => `- ID: ${i.id}, Nome: "${i.name}"`).join('\n')}`
        : '\nNenhum item de transação cadastrado no sistema.';

    const prompt = `Você é um assistente de extração de dados financeiros. Extraia todas as transações financeiras do texto abaixo.

Para cada transação encontrada, retorne um array JSON onde cada elemento tem exatamente estes campos:
- "rawText": o texto original da linha/linha correspondente à transação (string, obrigatório)
- "description": descrição da transação ou nome do estabelecimento (string ou null)
- "amount": valor numérico absoluto sem símbolo de moeda (number ou null)
- "type": "income" para receita ou "expense" para despesa (string ou null)
- "categoryId": UUID da categoria correspondente da lista abaixo se conseguir inferir, caso contrário null
- "accountId": UUID se houver ID de conta explícito no texto, caso contrário null
- "transactionItemId": UUID do item de transação correspondente da lista abaixo se conseguir inferir, caso contrário null
- "transactionDate": data da transação no formato YYYY-MM-DD (string ou null)
- "dueDate": data de vencimento no formato YYYY-MM-DD se diferente da transactionDate (string ou null)
- "settled": true se marcado como pago/liquidado, false se pendente, null se não informado

Contexto do sistema:
${categoriesContext}
${transactionItemsContext}

Regras:
- Retorne SOMENTE um array JSON válido, sem markdown, sem explicações, sem texto extra.
- Se não encontrar transações, retorne um array vazio: []
- Não invente dados. Se um campo não puder ser determinado, use null.
- Para valores, sempre use o número absoluto (positivo).
- Datas devem estar no formato YYYY-MM-DD.
- Para "categoryId" e "transactionItemId": use o UUID exato da lista acima se conseguir inferir qual corresponde à transação. Caso contrário, use null.

Texto para extração de transações:
---
${textContent}
---

Retorne apenas o array JSON:`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8192,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content
        .filter(block => block.type === 'text')
        .map(block => (block as { type: 'text'; text: string }).text)
        .join('');

      this.logger.debug(`Resposta Claude: ${responseText.length} caracteres`);

      let parsed: unknown[];
      try {
        parsed = JSON.parse(responseText.trim());
      } catch {
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1].trim());
        } else {
          this.logger.error(`Resposta não-JSON do Claude: ${responseText.substring(0, 200)}`);
          throw new InternalServerErrorException('Claude retornou resposta em formato inválido para extração de transações');
        }
      }

      if (!Array.isArray(parsed)) {
        throw new InternalServerErrorException('Claude retornou resposta não-array para extração de transações');
      }

      return parsed.map(item => this.mapClaudeItem(item as Record<string, unknown>));
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof InternalServerErrorException) {
        throw err;
      }
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      this.logger.error(`Falha na chamada à API do Claude: ${msg}`);
      throw new InternalServerErrorException(`Falha ao extrair transações via Claude: ${msg}`);
    }
  }

  private mapClaudeItem(item: Record<string, unknown>): ExtractedTransaction {
    const parseDate = (val: unknown): Date | null => {
      if (!val || typeof val !== 'string') return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    };

    const type =
      item['type'] === 'income'
        ? TransactionType.INCOME
        : item['type'] === 'expense'
          ? TransactionType.EXPENSE
          : null;

    return {
      rawText: typeof item['rawText'] === 'string' ? item['rawText'] : JSON.stringify(item),
      description: typeof item['description'] === 'string' ? item['description'] : null,
      amount: typeof item['amount'] === 'number' ? Math.abs(item['amount']) : null,
      type,
      categoryId: typeof item['categoryId'] === 'string' ? item['categoryId'] : null,
      accountId: typeof item['accountId'] === 'string' ? item['accountId'] : null,
      transactionItemId: typeof item['transactionItemId'] === 'string' ? item['transactionItemId'] : null,
      transactionDate: parseDate(item['transactionDate']),
      dueDate: parseDate(item['dueDate']),
      settled: typeof item['settled'] === 'boolean' ? item['settled'] : null,
    };
  }
}
