import moment from 'moment'

export const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

// month_report is "MM/YYYY", optionally followed by a suffix for extra payroll runs
// in the same month (e.g. "12/2022/1", "12/2025-bonus").
export const parseMonthReport = (monthReport: string) => {
    const match = /^(\d{1,2})\/(\d{4})(.*)$/.exec(monthReport || '')
    if (!match) return { year: 0, month: 0, suffix: monthReport || '' }
    return { year: Number(match[2]), month: Number(match[1]), suffix: match[3] }
}

// Oldest first: by year, then month; the regular report comes before its extra runs.
export const compareMonthReport = (a: string, b: string) => {
    const ka = parseMonthReport(a)
    const kb = parseMonthReport(b)
    if (ka.year !== kb.year) return ka.year - kb.year
    if (ka.month !== kb.month) return ka.month - kb.month
    if (ka.suffix === kb.suffix) return 0
    if (ka.suffix === '') return -1
    if (kb.suffix === '') return 1
    return ka.suffix < kb.suffix ? -1 : 1
}

export const sortNewestFirst = <T extends { month_report: string }>(list: T[]) =>
    [...(list || [])].sort((a, b) => compareMonthReport(b.month_report, a.month_report))

const suffixLabel = (suffix: string) => {
    if (suffix === '') return ''
    if (/^\/\d+$/.test(suffix)) return ` (รอบ ${Number(suffix.slice(1)) + 1})`
    if (suffix === '-bonus') return ' (โบนัส)'
    return ` (${suffix.replace(/^[-/]/, '')})`
}

// "10/2021" -> "ต.ค. 2564", "12/2025-bonus" -> "ธ.ค. 2568 (โบนัส)"; unknown formats are shown as is.
export const formatMonthReport = (monthReport: string) => {
    const { year, month, suffix } = parseMonthReport(monthReport)
    if (!year || month < 1 || month > 12) return monthReport || ''
    return `${THAI_MONTHS[month - 1]} ${year + 543}${suffixLabel(suffix)}`
}

// "25 ต.ค. 2564"
export const formatThaiDate = (date: moment.Moment) =>
    `${date.date()} ${THAI_MONTHS[date.month()]} ${date.year() + 543}`

// Salaries are normally paid on the 25th of the report month.
export const defaultPayDate = (monthReport: string) => {
    const { year, month } = parseMonthReport(monthReport)
    return year ? moment({ year, month: month - 1, date: 25 }) : null
}

// "MM/YYYY" of today, the month payroll is usually prepared for.
export const currentMonthReport = () => moment().format('MM/YYYY')
