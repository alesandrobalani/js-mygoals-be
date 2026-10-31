/**
 * Utilitários para datas sem horário ("date-only").
 *
 * Colunas `date` do TypeORM são lidas como string `YYYY-MM-DD` e gravadas a partir
 * dos getters locais do `Date`. Por isso toda a aritmética aqui é feita sobre os
 * componentes ano/mês/dia, e os `Date` produzidos representam meia-noite local.
 */

export interface DateParts {
  year: number;
  month: number; // 1-12
  day: number;
}

const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})/;
const YEAR_MONTH_REGEX = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function toDateParts(value: Date | string): DateParts {
  if (typeof value === 'string') {
    const match = DATE_ONLY_REGEX.exec(value);
    if (!match) {
      throw new Error(`Invalid date-only value: ${value}`);
    }
    return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  }
  return { year: value.getFullYear(), month: value.getMonth() + 1, day: value.getDate() };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Formata como `YYYY-MM-DD`. */
export function toDateOnly(value: Date | string): string {
  return formatDateParts(toDateParts(value));
}

function formatDateParts({ year, month, day }: DateParts): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Converte `YYYY-MM-DD` em `Date` à meia-noite local. */
export function fromDateOnly(value: string): Date {
  const { year, month, day } = toDateParts(value);
  return new Date(year, month - 1, day);
}

/** Competência (`YYYY-MM`) de uma data. */
export function toYearMonth(value: Date | string): string {
  return toDateOnly(value).slice(0, 7);
}

export function parseYearMonth(value: string): { year: number; month: number } {
  const match = YEAR_MONTH_REGEX.exec(value);
  if (!match) {
    throw new Error(`Invalid year-month value: ${value}`);
  }
  return { year: Number(match[1]), month: Number(match[2]) };
}

/** Número de meses de `from` até `to` (ambos `YYYY-MM`). */
export function monthsBetween(from: string, to: string): number {
  const a = parseYearMonth(from);
  const b = parseYearMonth(to);
  return (b.year - a.year) * 12 + (b.month - a.month);
}

/**
 * Soma `months` meses à data, mantendo o dia. Se o dia não existir no mês de destino,
 * usa o último dia do mês (ex.: 31/01 + 1 → 28/02, ou 29/02 em ano bissexto).
 * Retorna `YYYY-MM-DD`.
 */
export function addMonthsClamped(value: Date | string, months: number): string {
  const { year, month, day } = toDateParts(value);
  const totalMonths = year * 12 + (month - 1) + months;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = totalMonths - targetYear * 12 + 1;
  const targetDay = Math.min(day, daysInMonth(targetYear, targetMonth));
  return formatDateParts({ year: targetYear, month: targetMonth, day: targetDay });
}
