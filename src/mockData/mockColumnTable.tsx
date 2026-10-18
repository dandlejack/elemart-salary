import { Button, Dropdown, Menu, Modal, Space, Tag } from "antd"
import { DeleteOutlined, MoreOutlined, UserDeleteOutlined, UserAddOutlined } from "@ant-design/icons"
import React from "react"
import { Link } from "react-router-dom"
import { IEmployeeListItem, isResigned } from "../api/EmployeeApi"
import { calcSalaryTotals, formatMoney, isNumeric } from "../utils/Salary"
import { formatMonthReport } from "../utils/Month"

// Asks before deleting; the message names what will be deleted and what is lost.
export const confirmDelete = (title: React.ReactNode, warning: string, onOk: () => Promise<any>) => Modal.confirm({
    title,
    content: warning,
    okText: 'ลบ',
    okButtonProps: { danger: true },
    cancelText: 'ยกเลิก',
    onOk,
})

// Money columns: 2 decimals with commas; zeros are faded so real amounts stand out.
// Empty cells (e.g. fund before it existed) stay empty.
export const moneyCell = (value: any) => {
    if (value === undefined || value === null || value === '') return ''
    if (isNumeric(value) && Number(value) === 0) return <span className='money-zero'>0.00</span>
    return formatMoney(value)
}

interface EmployeeColumnActions {
    onStatusChange: (employee: IEmployeeListItem, status: 'active' | 'resigned') => void
    onDelete: (employee: IEmployeeListItem) => void
}

export const employeeColumns = ({ onStatusChange, onDelete }: EmployeeColumnActions) => [
    {
        title: 'ชื่อ-สกุล',
        key: 'fullname',
        dataIndex: 'fullname',
        render: (fullname: string, record: IEmployeeListItem) => <Link to={'/EmployeeInfo/' + record.employee_id}>{fullname}</Link>
    },
    {
        title: 'เงินเดือน',
        key: 'current_salary',
        dataIndex: 'current_salary',
        width: 160,
        align: 'right' as const,
        sorter: (a: IEmployeeListItem, b: IEmployeeListItem) => (a.current_salary || 0) - (b.current_salary || 0),
        render: moneyCell
    },
    {
        title: 'สถานะ',
        key: 'status',
        dataIndex: 'status',
        width: 120,
        render: (_: any, record: IEmployeeListItem) => isResigned(record) ? <Tag>ลาออก</Tag> : <Tag color='green'>ทำงานอยู่</Tag>
    },
    {
        title: '',
        key: 'operation',
        dataIndex: 'operation',
        width: 190,
        render: (_: any, record: IEmployeeListItem) => (
            <Space>
                <Link to={'/EmployeeInfo/' + record.employee_id}>
                    <Button size='small'>ดูสลิปเงินเดือน</Button>
                </Link>
                <Dropdown trigger={['click']} overlay={
                    <Menu>
                        {isResigned(record)
                            ? <Menu.Item key='active' icon={<UserAddOutlined />} onClick={() => onStatusChange(record, 'active')}>กลับมาทำงาน</Menu.Item>
                            : <Menu.Item key='resigned' icon={<UserDeleteOutlined />} onClick={() => onStatusChange(record, 'resigned')}>ตั้งเป็นลาออก</Menu.Item>}
                        <Menu.Divider />
                        <Menu.Item key='delete' danger icon={<DeleteOutlined />} onClick={() => onDelete(record)}>ลบพนักงาน</Menu.Item>
                    </Menu>
                }>
                    <Button size='small' type='text' icon={<MoreOutlined />} title='เพิ่มเติม' />
                </Dropdown>
            </Space>
        ),
    }
]

const monthListColumns = (detailPath: string, idField: string, onDelete: (record: any) => void) => [
    {
        title: 'เดือน',
        key: 'month_report',
        dataIndex: 'month_report',
        render: (month: string, record: any) => <Link to={detailPath + record[idField]}>{formatMonthReport(month)}</Link>
    },
    {
        title: '',
        key: 'operation',
        dataIndex: 'operation',
        width: 160,
        render: (_: any, record: any) => (
            <Space>
                <Link to={detailPath + record[idField]}>
                    <Button size='small'>ดูรายละเอียด</Button>
                </Link>
                <Button size='small' type='text' danger icon={<DeleteOutlined />} title='ลบ' onClick={() => onDelete(record)} />
            </Space>
        ),
    }
]

export const salaryMonthColumns = (onDelete: (record: any) => void) => monthListColumns('/ReportInfo/', 'report_id', onDelete)

export const pettyCashListColumns = (onDelete: (record: any) => void) => monthListColumns('/PettyCashInfo/', 'pettycash_id', onDelete)

// A number cell that held text in the imported Excel file is shown in orange with the original text as a tooltip.
const salaryNumberCell = (dataIndex: string) => (value: any, record: any) => {
    if (record._textCells && record._textCells.includes(dataIndex)) {
        return <span className='cell-text-warning' title={`ในไฟล์ Excel ช่องนี้เป็นข้อความ จึงถูกตั้งเป็น 0 (ดูหมายเหตุ)`}>⚠ {formatMoney(value)}</span>
    }
    return moneyCell(value)
}

export const AddSalaryColumn: any[] = [
    {
        title: 'ลำดับ',
        key: 'key',
        dataIndex: 'key',
        width: 64,
        align: 'center',
        fixed: 'left' as any | undefined
    },
    {
        title: 'ชื่อ-สกุล',
        key: 'fullname',
        dataIndex: 'fullname',
        dataType: 'select',
        width: 200,
        fixed: 'left' as any | undefined,
        editable: true
    },
    {
        title: 'เงินเดือน',
        key: 'salary',
        dataIndex: 'salary',
        dataType: 'number',
    },
    {
        title: 'โอที',
        key: 'overtime',
        dataIndex: 'overtime',
        dataType: 'number',
        editable: true
    },
    {
        title: 'เบี้ยเลี้ยง',
        key: 'allowance',
        dataIndex: 'allowance',
        dataType: 'number',
        editable: true
    },
    {
        title: 'ค่าน้ำมัน',
        key: 'fuel',
        dataIndex: 'fuel',
        dataType: 'number',
        editable: true
    },
    {
        title: 'นายหน้า',
        key: 'agent',
        dataIndex: 'agent',
        dataType: 'number',
        editable: true
    },
    {
        title: 'โบนัส',
        key: 'bonus',
        dataIndex: 'bonus',
        dataType: 'number',
        editable: true
    },
    {
        title: 'ประกันสังคม',
        key: 'social_security',
        dataIndex: 'social_security',
        dataType: 'number',
        editable: true
    },
    {
        title: 'ภาษีเงินได้',
        key: 'tax',
        dataIndex: 'tax',
        dataType: 'number',
        editable: true
    },
    {
        title: 'ภาษีนายหน้า',
        key: 'agent_tax',
        dataIndex: 'agent_tax',
        dataType: 'number',
        editable: true
    },
    {
        title: 'เงินกู้,เงินยืม',
        key: 'lending',
        dataIndex: 'lending',
        dataType: 'number',
        editable: true
    },
    {
        title: 'มาสาย',
        key: 'late',
        dataIndex: 'late',
        dataType: 'number',
        editable: true
    },
    {
        title: 'ขาดงาน',
        key: 'absent',
        dataIndex: 'absent',
        dataType: 'number',
        editable: true
    },
    {
        title: 'ภาษีโบนัส',
        key: 'bonus_tax',
        dataIndex: 'bonus_tax',
        dataType: 'number',
        editable: true
    },
    {
        title: 'กองทุน',
        key: 'fund',
        dataIndex: 'fund',
        dataType: 'number',
        editable: true
    },
    {
        title: 'สุทธิ',
        key: 'net',
        dataIndex: 'net',
        width: 120,
        align: 'right' as const,
        render: (value: any, record: any) => <b>{formatMoney(calcSalaryTotals(record).net)}</b>
    },
    {
        title: 'หมายเหตุ',
        key: 'note',
        dataIndex: 'note',
        width: 220,
        editable: true
    },
].map((col: any) => col.dataType === 'number' ? { align: 'right', render: salaryNumberCell(col.dataIndex), width: 110, ...col } : col)

// Petty cash amounts: commas, faded zeros.
const pettyMoney = { dataType: 'number', editable: true, width: 130, align: 'right' as const, render: moneyCell }

export const AddPettyCashColumn: any[] = [
    {
        title: 'วันที่',
        key: 'dateInMonth',
        dataIndex: 'dateInMonth',
        width: 70,
        align: 'center',
        dataType: 'number',
        editable: true,
        // 0 means "same day as the entry above".
        render: (value: any) => value ? value : ''
    },
    {
        title: 'รายละเอียด',
        key: 'description',
        dataIndex: 'description',
        width: 360,
        editable: true,
        render: (value: any) => value === '-' ? '' : value
    },
    {
        title: 'เงินรับ',
        key: 'received',
        dataIndex: 'received',
        children: [
            { title: 'เงินสด', key: 'received_cash', dataIndex: 'received_cash', ...pettyMoney },
            { title: 'ธนาคาร', key: 'received_bank', dataIndex: 'received_bank', ...pettyMoney }
        ]
    },
    {
        title: 'เงินจ่าย',
        key: 'paid',
        dataIndex: 'paid',
        children: [
            { title: 'เงินสด', key: 'paid_cash', dataIndex: 'paid_cash', ...pettyMoney },
            { title: 'ธนาคาร', key: 'paid_bank', dataIndex: 'paid_bank', ...pettyMoney }
        ]
    },
    {
        title: 'คงเหลือ',
        key: 'pettycash_total',
        dataIndex: 'pettycash_total',
        width: 140,
        dataType: 'number',
        align: 'right' as const,
        render: (value: any) => <b>{formatMoney(value)}</b>
    },
]
