import { calcAgentTax, calcFund, calcSalaryTotals, calcSocialSecurity, formatMoney, isFundMonth, isNamelessRow, normalizeName, toNumber } from './Salary'

describe('isNamelessRow', () => {
    it('flags rows without an employee name', () => {
        expect(isNamelessRow({ fullname: 'undefined -' })).toBe(true)
        expect(isNamelessRow({ fullname: '  ' })).toBe(true)
        expect(isNamelessRow({})).toBe(true)
        expect(isNamelessRow({ fullname: 'นายธานี แซ่เอี๊ย' })).toBe(false)
    })
})

describe('calcSocialSecurity', () => {
    it('caps at 750 before 2026', () => {
        expect(calcSocialSecurity(125000, 2025)).toBe(750)
        expect(calcSocialSecurity(15000, 2025)).toBe(750)
    })
    it('caps at 875 from 2026', () => {
        expect(calcSocialSecurity(125000, 2026)).toBe(875)
        expect(calcSocialSecurity(17500, 2026)).toBe(875)
        expect(calcSocialSecurity(16800, 2026)).toBe(840)
    })
    it('rounds to whole baht like the payroll sheet', () => {
        expect(calcSocialSecurity(15750, 2026)).toBe(788)
        expect(calcSocialSecurity(11552, 2026)).toBe(578)
    })
    it('treats missing salary as 0', () => {
        expect(calcSocialSecurity(null as any, 2026)).toBe(0)
    })
})

describe('calcAgentTax', () => {
    it('is 5% of the agent amount', () => {
        expect(calcAgentTax(2500)).toBe(125)
        expect(calcAgentTax(0)).toBe(0)
    })
})

describe('toNumber / formatMoney', () => {
    it('converts numeric strings and ignores text', () => {
        expect(toNumber('125.00')).toBe(125)
        expect(toNumber(' ลาออก วันที่ 3 เมษายน')).toBe(0)
        expect(toNumber(undefined)).toBe(0)
    })
    it('formats numbers and keeps text as is', () => {
        expect(formatMoney(1234.5)).toBe('1,234.50')
        expect(formatMoney('250.00')).toBe('250.00')
        expect(formatMoney('ลาออก')).toBe('ลาออก')
        expect(formatMoney(undefined)).toBe('0.00')
    })
})

describe('calcSalaryTotals', () => {
    it('sums income and deductions, ignoring text and missing fields', () => {
        const row = {
            salary: 30000, overtime: ' ลาออก', allowance: 500, fuel: 0, agent: 2500, bonus: 0,
            social_security: 875, tax: 1000, agent_tax: '125.00', lending: 0, late: 50, absent: 0
        }
        expect(calcSalaryTotals(row)).toEqual({ gross: 33000, deductions: 2050, net: 30950 })
    })
})

describe('normalizeName', () => {
    it('trims and collapses repeated spaces', () => {
        expect(normalizeName('  นส.สุนิสา  หนูแป้นน้อย ')).toBe('นส.สุนิสา หนูแป้นน้อย')
        expect(normalizeName(undefined as any)).toBe('')
    })
})

describe('fund', () => {
    it('starts with the 10/2026 payroll', () => {
        expect(isFundMonth('09/2026')).toBe(false)
        expect(isFundMonth('10/2026')).toBe(true)
        expect(isFundMonth('12/2026-bonus')).toBe(true)
        expect(isFundMonth('01/2027')).toBe(true)
        expect(isFundMonth('12/2025')).toBe(false)
        expect(isFundMonth('')).toBe(false)
    })
    it('is 0.25% of salary in satang, 0 before it started', () => {
        expect(calcFund(30000, '10/2026')).toBe(75)
        expect(calcFund(11646, '10/2026')).toBe(29.12)
        expect(calcFund(30000, '09/2026')).toBe(0)
    })
    it('counts as a deduction', () => {
        expect(calcSalaryTotals({ salary: 30000, social_security: 875, fund: 75 })).toEqual({ gross: 30000, deductions: 950, net: 29050 })
    })
})
