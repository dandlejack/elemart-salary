import { percentChange, totalsByMonth } from './Dashboard'

describe('totalsByMonth', () => {
    it('adds extra runs into their month, ignores nameless rows and sorts oldest first', () => {
        const result = totalsByMonth([
            { month_report: '12/2025-bonus', attributes: [{ fullname: 'A B', bonus: 1000, bonus_tax: 50 }] },
            { month_report: '12/2025', attributes: [{ fullname: 'A B', salary: 20000, social_security: 750, tax: 100 }, { fullname: 'undefined -', salary: 20000 }] },
            { month_report: '11/2025', attributes: [{ fullname: 'A B', salary: 20000, social_security: 750 }] },
        ])
        expect(result.map(m => m.month)).toEqual(['11/2025', '12/2025'])
        expect(result[1]).toEqual({ month: '12/2025', gross: 21000, net: 21000 - 750 - 100 - 50, socialSecurity: 750, withholdingTax: 150, headcount: 1 })
    })
})

describe('percentChange', () => {
    it('is null without a previous value', () => {
        expect(percentChange(110, 100)).toBeCloseTo(10)
        expect(percentChange(5, undefined)).toBeNull()
        expect(percentChange(5, 0)).toBeNull()
    })
})
