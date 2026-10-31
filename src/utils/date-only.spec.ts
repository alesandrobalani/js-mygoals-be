import { addMonthsClamped, fromDateOnly, monthsBetween, toDateOnly, toYearMonth } from './date-only';

describe('date-only utils', () => {
  describe('addMonthsClamped', () => {
    it('mantém o dia quando ele existe no mês de destino', () => {
      expect(addMonthsClamped('2026-01-15', 1)).toBe('2026-02-15');
      expect(addMonthsClamped('2026-03-30', 1)).toBe('2026-04-30');
    });

    it('ajusta dia 31 para o último dia de meses com 30 dias', () => {
      expect(addMonthsClamped('2026-03-31', 1)).toBe('2026-04-30');
      expect(addMonthsClamped('2026-08-31', 1)).toBe('2026-09-30');
    });

    it('ajusta dias 29, 30 e 31 para 28/02 em ano não bissexto', () => {
      expect(addMonthsClamped('2026-01-29', 1)).toBe('2026-02-28');
      expect(addMonthsClamped('2026-01-30', 1)).toBe('2026-02-28');
      expect(addMonthsClamped('2026-01-31', 1)).toBe('2026-02-28');
    });

    it('usa 29/02 em ano bissexto', () => {
      expect(addMonthsClamped('2028-01-31', 1)).toBe('2028-02-29');
      expect(addMonthsClamped('2028-01-29', 1)).toBe('2028-02-29');
      expect(addMonthsClamped('2027-03-31', 11)).toBe('2028-02-29');
    });

    it('a partir de 29/02 mantém o dia 29 nos meses seguintes', () => {
      expect(addMonthsClamped('2028-02-29', 1)).toBe('2028-03-29');
      expect(addMonthsClamped('2028-02-29', 12)).toBe('2029-02-28');
    });

    it('vira o ano corretamente', () => {
      expect(addMonthsClamped('2026-11-30', 2)).toBe('2027-01-30');
      expect(addMonthsClamped('2026-12-31', 1)).toBe('2027-01-31');
      expect(addMonthsClamped('2026-10-31', 14)).toBe('2027-12-31');
    });

    it('aceita deslocamentos negativos e zero', () => {
      expect(addMonthsClamped('2027-01-31', -1)).toBe('2026-12-31');
      expect(addMonthsClamped('2026-03-31', -1)).toBe('2026-02-28');
      expect(addMonthsClamped('2026-05-10', 0)).toBe('2026-05-10');
    });

    it('aceita Date (componentes locais)', () => {
      expect(addMonthsClamped(new Date(2026, 0, 31), 1)).toBe('2026-02-28');
    });
  });

  it('monthsBetween calcula a distância entre competências', () => {
    expect(monthsBetween('2026-11', '2027-01')).toBe(2);
    expect(monthsBetween('2026-11', '2026-11')).toBe(0);
    expect(monthsBetween('2027-01', '2026-12')).toBe(-1);
  });

  it('toYearMonth / toDateOnly / fromDateOnly são consistentes', () => {
    expect(toYearMonth('2026-11-05')).toBe('2026-11');
    expect(toDateOnly(fromDateOnly('2026-02-28'))).toBe('2026-02-28');
  });
});
