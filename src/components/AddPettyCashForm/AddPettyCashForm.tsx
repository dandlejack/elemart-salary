import React, { useEffect, useState } from 'react'
import { Alert, Button, DatePicker, message, Space, Typography } from 'antd'
import moment from 'moment'
import { EditableTable } from '../EditTable/EditableTable'
import { AddPettyCashColumn, pettyCashSummary } from '../../mockData/mockColumnTable'
import { PettyCashApi } from '../../api/PettyCashApi'
import { currentMonthReport, formatMonthReport, sortNewestFirst } from '../../utils/Month'
import { formatMoney } from '../../utils/Salary'

interface Props {
    // Existing petty cash months (full records), for the duplicate warning and the carried-forward balance.
    existing: any[]
    onDone: () => void
    onDirtyChange?: (dirty: boolean) => void
}

export const AddPettyCashForm: React.FC<Props> = ({ existing, onDone, onDirtyChange }) => {
    const [month, setMonth] = useState(currentMonthReport())
    const [rows, setRows] = useState([] as any[])
    const [initialRows, setInitialRows] = useState([] as any[])
    const [saving, setSaving] = useState(false)

    // Start the month with the latest month's ending balance carried forward.
    const latest = sortNewestFirst(existing)[0]
    const carried = latest && (latest.attributes || []).length > 0 ? pettyCashSummary(latest).balance : null
    useEffect(() => {
        if (carried !== null && carried !== 0) {
            setInitialRows([{ dateInMonth: 1, description: 'ยอดยกมา', received_cash: carried, received_bank: 0, paid_cash: 0, paid_bank: 0, pettycash_total: carried }])
        }
    }, [carried]);

    useEffect(() => {
        if (onDirtyChange) onDirtyChange(rows.length > initialRows.length)
    }, [rows.length, initialRows.length, onDirtyChange]);

    const monthExists = existing.some(item => item.month_report === month)

    const onSave = async () => {
        if (month === '') {
            message.error('กรุณาเลือกเดือน')
            return
        }
        if (rows.length === 0) {
            message.error('ยังไม่มีรายการ กรุณาเพิ่มอย่างน้อย 1 รายการ')
            return
        }
        setSaving(true)
        try {
            await PettyCashApi.insertPettyCashReport({ month_report: month, year_of_report: month.split('/')[1], attributes: rows })
            message.success(`บันทึกสมุดเงินสดย่อย ${formatMonthReport(month)} แล้ว`)
            onDone()
        } catch (e) {
            message.error('บันทึกไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ')
        }
        setSaving(false)
    }

    return <div>
        <Space className='mb-16' align='center' wrap>
            <span>เดือน</span>
            <DatePicker format={'MM/YYYY'} picker="month" allowClear={false} value={month ? moment(month, 'MM/YYYY') : null} onChange={(date: any, dateString: string) => setMonth(dateString)} />
            <Typography.Text type='secondary'>{formatMonthReport(month)}</Typography.Text>
        </Space>
        {monthExists ? <Alert className='mb-16' type='warning' showIcon message={`มีสมุดเงินสดย่อย ${formatMonthReport(month)} อยู่แล้ว — ถ้าบันทึกจะได้ซ้ำ ถ้าต้องการแก้ไขให้เปิดเดือนเดิม`} /> : null}
        {carried !== null && carried !== 0 && latest ? <Alert className='mb-16' type='info' showIcon
            message={`ใส่ยอดยกมาจาก ${formatMonthReport(latest.month_report)} (${formatMoney(carried)} บาท) เป็นรายการแรกให้แล้ว — แก้ไขหรือลบได้`} /> : null}
        <EditableTable column={AddPettyCashColumn} getData={setRows} oldData={initialRows} showData={0} sticky={false} tableName='petty-cash' addable />
        <div className='form-actions'>
            <Button type='primary' size='large' onClick={onSave} loading={saving} disabled={rows.length === 0}>บันทึกสมุดเงินสดย่อย</Button>
        </div>
    </div>
}
