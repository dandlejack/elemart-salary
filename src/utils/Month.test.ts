import { compareMonthReport, defaultPayDate, formatMonthReport, formatThaiDate, sortNewestFirst } from './Month'

describe('formatMonthReport', () => {
    it('shows Thai month and Buddhist year', () => {
        expect(formatMonthReport('10/2021')).toBe('ต.ค. 2564')
        expect(formatMonthReport('01/2026')).toBe('ม.ค. 2569')
    })
    it('labels extra payroll runs', () => {
        expect(formatMonthReport('12/2022/1')).toBe('ธ.ค. 2565 (รอบ 2)')
        expect(formatMonthReport('12/2025-bonus')).toBe('ธ.ค. 2568 (โบนัส)')
    })
    it('keeps unknown formats', () => {
        expect(formatMonthReport('abc')).toBe('abc')
        expect(formatMonthReport('')).toBe('')
    })
})

describe('sorting', () => {
    it('sorts newest first with extra runs after the regular month', () => {
        const list = ['12/2022', '01/2021', '12/2022/1', '09/2026', '12/2025-bonus', '12/2025'].map(month_report => ({ month_report }))
        expect(sortNewestFirst(list).map(r => r.month_report)).toEqual(['09/2026', '12/2025-bonus', '12/2025', '12/2022/1', '12/2022', '01/2021'])
        expect(compareMonthReport('02/2021', '12/2020')).toBeGreaterThan(0)
    })
})

describe('pay date', () => {
    it('defaults to the 25th of the report month', () => {
        expect(formatThaiDate(defaultPayDate('10/2021')!)).toBe('25 ต.ค. 2564')
        expect(defaultPayDate('x')).toBeNull()
    })
})
