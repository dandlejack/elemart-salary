import { useEffect, useRef, useState } from 'react'
import { Button, Table, Popconfirm } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import {
    EditableCell,
    EditableRow,
} from './EditableCell';
import { EmployeeApi, IEmployeeListItem } from '../../api/EmployeeApi';
import { TableProps } from '../../types/EditTableTypes';
import { calcAgentTax, normalizeName, toNumber } from '../../utils/Salary';
import { stickyHeader } from '../../utils/TableLayout';

// Works on copies so the caller's rows only change through `getData` (cancel can always revert).
// `key` is the running row number shown in the first column.
const toRows = (data: any[]) => (data || []).map(({ operation, ...row }: any, index: number) => ({ ...row, key: index + 1 }))

// Each petty cash row's balance is the previous balance plus its receipts minus its payments.
export const recalcPettyCashBalance = (rows: any[]) => {
    let balance = 0
    return rows.map(row => {
        balance += toNumber(row.received_cash) + toNumber(row.received_bank) - toNumber(row.paid_cash) - toNumber(row.paid_bank)
        return { ...row, pettycash_total: Math.round(balance * 100) / 100 }
    })
}

const leafColumns = (columns: any[]): any[] => columns.flatMap(col => col.children ? leafColumns(col.children) : [col])

export const EditableTable: React.FC<TableProps> = (props) => {
    const { tableName, deletable = true } = props
    const [rows, setRows] = useState<any[]>(() => toRows(props.oldData))
    const [employees, setEmployees] = useState([] as IEmployeeListItem[])
    // The rows last sent to the caller; when they come back as `oldData` they are not reloaded.
    const emitted = useRef<any[] | null>(null)
    const needsEmployees = leafColumns(props.column).some(col => col.dataIndex === 'fullname' && col.dataType === 'select')

    useEffect(() => {
        if (props.oldData !== emitted.current) setRows(toRows(props.oldData))
    }, [props.oldData]);

    useEffect(() => {
        emitted.current = rows
        if (props.getData !== undefined) props.getData(rows)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows])

    useEffect(() => {
        if (needsEmployees) EmployeeApi.findAllEmployees().then(setEmployees).catch(() => setEmployees([]))
    }, [needsEmployees]);

    const update = (next: any[]) => setRows(tableName === 'petty-cash' ? recalcPettyCashBalance(next) : next)

    const handleDelete = (key: number) => {
        update(toRows(rows.filter((item: any) => item.key !== key)))
    };

    const handleSave = (row: any) => {
        const previous = rows.find((item: any) => item.key === row.key)
        if (tableName === 'salary-table' && previous) {
            // Social security is taken as entered (rates vary by period). Agent tax follows the agent amount
            // only when that amount was edited, so a manually corrected agent tax is kept otherwise.
            if (previous.agent !== row.agent) row.agent_tax = calcAgentTax(row.agent)
            // A name picked from the employee list links the row to that employee.
            if (previous.fullname !== row.fullname) {
                const employee = employees.find(e => normalizeName(e.fullname) === normalizeName(row.fullname))
                row.employees_id = employee ? employee.employee_id : undefined
            }
        }
        update(rows.map((item: any) => item.key === row.key ? { ...item, ...row } : item));
    };

    const handleAdd = () => {
        const newRow: any = { key: rows.length + 1 }
        leafColumns(props.column).forEach((col: any) => {
            if (col.dataIndex === 'key' || col.dataIndex === 'operation') return
            newRow[col.dataIndex] = col.dataType === 'number' ? 0 : ''
        })
        // New petty cash entries usually belong to the same day as the previous one.
        if (tableName === 'petty-cash' && rows.length > 0) newRow.dateInMonth = rows[rows.length - 1].dateInMonth
        update([...rows, newRow])
    }

    const employeeNames = employees.map(e => e.fullname)
    const mapColumns = (col: any): any => {
        if (col.children) return { ...col, children: col.children.map(mapColumns) }
        if (!col.editable) return col
        return {
            ...col,
            onCell: (record: any) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                dataType: col.dataType,
                options: col.dataType === 'select' ? employeeNames : undefined,
                handleSave,
            }),
        };
    };
    const columns = props.column.filter((col: any) => col.dataIndex !== 'operation').map(mapColumns)
    if (deletable) {
        columns.push({
            title: '',
            key: 'operation',
            dataIndex: 'operation',
            width: 56,
            align: 'center',
            render: (_: any, record: any) => (
                <Popconfirm
                    title={record.fullname ? <>ลบแถวของ <b>{record.fullname}</b>?</> : 'ลบแถวนี้?'}
                    okText='ลบ'
                    cancelText='ยกเลิก'
                    okButtonProps={{ danger: true }}
                    onConfirm={() => handleDelete(record.key)}
                >
                    <Button type='text' danger size='small' icon={<DeleteOutlined />} title='ลบแถว' />
                </Popconfirm>
            ),
        })
    }

    return <div className='editing-table'>
        <Table
            columns={columns}
            dataSource={rows}
            components={{ body: { row: EditableRow, cell: EditableCell } }}
            bordered
            size='middle'
            style={{ width: '100%' }}
            scroll={{ x: 'max-content' }}
            {...(props.showData === 0 ? {
                pagination: false,
                sticky: props.sticky === false ? undefined : stickyHeader,
            } : {
                pagination: { pageSize: props.showData },
            })}
            summary={props.summary}
            rowClassName={props.rowClassName}
        />
        {props.addable ? <Button type='dashed' block icon={<PlusOutlined />} onClick={handleAdd} style={{ marginTop: 8 }}>เพิ่มรายการ</Button> : null}
    </div>
}
