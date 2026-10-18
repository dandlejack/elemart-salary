import { calcSalaryTotals, isNamelessRow, toNumber } from './Salary'
import { compareMonthReport, parseMonthReport } from './Month'

export interface MonthTotals {
    // "MM/YYYY"; extra runs of the same month (bonus, round 2) are added in.
    month: string
    gross: number
    net: number
    socialSecurity: number
    // Income, agent and bonus tax withheld.
    withholdingTax: number
    // People paid in the month's regular report.
    headcount: number
}

// Totals per calendar month, oldest first. Rows without a name (old imported total rows) are ignored.
export const totalsByMonth = (reports: Array<{ month_report: string, attributes: any[] }>): MonthTotals[] => {
    const byMonth: { [month: string]: MonthTotals } = {}
    reports.forEach(report => {
        const { year, month, suffix } = parseMonthReport(report.month_report)
        if (!year) return
        const key = `${String(month).padStart(2, '0')}/${year}`
        const totals = byMonth[key] || (byMonth[key] = { month: key, gross: 0, net: 0, socialSecurity: 0, withholdingTax: 0, headcount: 0 })
        const rows = (report.attributes || []).filter(row => !isNamelessRow(row))
        rows.forEach(row => {
            const { gross, net } = calcSalaryTotals(row)
            totals.gross += gross
            totals.net += net
            totals.socialSecurity += toNumber(row.social_security)
            totals.withholdingTax += toNumber(row.tax) + toNumber(row.agent_tax) + toNumber(row.bonus_tax)
        })
        if (suffix === '') totals.headcount = rows.length
        else if (totals.headcount === 0) totals.headcount = rows.length
    })
    return Object.values(byMonth).sort((a, b) => compareMonthReport(a.month, b.month))
}

// Relative change, or null when there is nothing to compare with.
export const percentChange = (current: number, previous: number | undefined) =>
    previous === undefined || previous === 0 ? null : (current - previous) / previous * 100
