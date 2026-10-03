import { AddComma } from "./AddComma";

export const INCOME_FIELDS = ['salary', 'overtime', 'allowance', 'fuel', 'agent', 'bonus']
export const DEDUCTION_FIELDS = ['social_security', 'tax', 'agent_tax', 'lending', 'late', 'absent', 'bonus_tax', 'fund']
export const NUMERIC_FIELDS = [...INCOME_FIELDS, ...DEDUCTION_FIELDS]

const SOCIAL_SECURITY_RATE = 0.05
const AGENT_TAX_RATE = 0.05
const FUND_RATE = 0.0025
// Fund deduction starts with the 10/2026 payroll.
const FUND_START = { year: 2026, month: 10 }

// "MM/YYYY", optionally with a suffix for extra payroll runs ("12/2025-bonus").
const parseMonthReport = (monthReport: string) => {
    const match = /^(\d{1,2})\/(\d{4})/.exec(monthReport || '')
    return match ? { year: Number(match[2]), month: Number(match[1]) } : null
}

export const isFundMonth = (monthReport: string) => {
    const parsed = parseMonthReport(monthReport)
    if (!parsed) return false
    return parsed.year > FUND_START.year || (parsed.year === FUND_START.year && parsed.month >= FUND_START.month)
}

// 0.25% of salary, in satang; 0 for payroll months before the fund started.
export const calcFund = (salary: number, monthReport: string) =>
    isFundMonth(monthReport) ? Math.round((salary || 0) * FUND_RATE * 100) / 100 : 0

// Wage ceiling for social security contributions: 15,000 (750 baht max) until 2025, 17,500 (875 baht max) from 2026.
const socialSecurityWageCeiling = (year: number) => year >= 2026 ? 17500 : 15000

// Default contribution only; the actual amount comes from the payroll sheet and may differ
// (e.g. the reduced rates used in 2021-2022), so never overwrite a value the user entered.
export const calcSocialSecurity = (salary: number, year: number = new Date().getFullYear()) =>
    Math.round(Math.min(salary || 0, socialSecurityWageCeiling(year)) * SOCIAL_SECURITY_RATE)

export const calcAgentTax = (agent: number) => Math.round((agent || 0) * AGENT_TAX_RATE * 100) / 100

// Names are matched by exact string, so compare and send them trimmed with single spaces.
export const normalizeName = (name: string) => (name || '').replace(/\s+/g, ' ').trim()

export const isNumeric = (value: any) =>
    typeof value === 'number' ? !isNaN(value) : typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))

export const toNumber = (value: any): number => isNumeric(value) ? Number(value) : 0

// Numbers get 2 decimals and commas; free text that ended up in a numeric field is shown as is.
export const formatMoney = (value: any): string => {
    if (value === undefined || value === null || value === '') return AddComma(0)
    if (isNumeric(value)) return AddComma(Number(value))
    return String(value)
}

export const calcSalaryTotals = (row: any) => {
    const gross = INCOME_FIELDS.reduce((sum, field) => sum + toNumber(row[field]), 0)
    const deductions = DEDUCTION_FIELDS.reduce((sum, field) => sum + toNumber(row[field]), 0)
    return { gross, deductions, net: gross - deductions }
}
