import { Table } from 'antd'
import { calcSalaryTotals, formatMoney, isNamelessRow, NUMERIC_FIELDS, toNumber } from '../../utils/Salary'

// Builds a Table `summary` that totals every money column of the rows currently shown.
// Rows without a name (old imported Excel total rows) are left out so totals are not doubled.
export const salarySummary = (columns: any[]) => (pageData: readonly any[]) => {
    const rows = pageData.filter(row => !isNamelessRow(row))
    const sum = (field: string) => rows.reduce((total, row) => total + toNumber(row[field]), 0)
    return <Table.Summary.Row className='salary-summary-row'>
        {columns.map((col, index) => {
            let content: React.ReactNode = ''
            if (index === 0) content = 'รวม'
            else if (col.dataIndex === 'fullname') content = `${rows.length} คน`
            else if (col.dataIndex === 'net') content = formatMoney(rows.reduce((total, row) => total + calcSalaryTotals(row).net, 0))
            else if (NUMERIC_FIELDS.includes(col.dataIndex)) content = formatMoney(sum(col.dataIndex))
            return <Table.Summary.Cell key={col.key} index={index}>
                <div style={{ textAlign: col.align || 'left' }}>{content}</div>
            </Table.Summary.Cell>
        })}
    </Table.Summary.Row>
}
