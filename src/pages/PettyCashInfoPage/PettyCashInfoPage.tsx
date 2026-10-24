import { Alert, Button, Empty, message, Skeleton, Table } from 'antd'
import { EditOutlined, FileExcelOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import { Prompt } from 'react-router-dom'
import { PettyCashApi } from '../../api/PettyCashApi'
import { EditableTable, recalcPettyCashBalance } from '../../components/EditTable/EditableTable'
import { generateExcel } from '../../components/Excel/ExcelComponent'
import { HeaderComponent } from '../../components/HeaderComponent'
import { LoadError } from '../../components/LoadError/LoadError'
import { AddPettyCashColumn, pettyCashSummary } from '../../mockData/mockColumnTable'
import { formatMonthReport } from '../../utils/Month'
import { formatMoney } from '../../utils/Salary'
import { stickyHeader } from '../../utils/TableLayout'
import { useRequest } from '../../utils/useRequest'
import { confirmDiscard, DISCARD_MESSAGE } from '../../utils/confirmDiscard'
import { useUnsavedChangesWarning } from '../../utils/useUnsavedChangesWarning'

const comparable = (rows: any[]) => JSON.stringify((rows || []).map(({ operation, key, ...row }: any) => row))

export const PettyCashInfoPage: React.FC<{ match: any }> = ({ match }) => {
    const { id } = match.params
    const request = useRequest(() => PettyCashApi.findReportByPettyCashId(id), [id])
    const book = request.data
    // Running balances are recalculated: older months stored stale ones (only the edited row used to be updated).
    const saved: any[] = book ? recalcPettyCashBalance((book.attributes || []).map(({ operation, ...row }: any) => row)) : []
    // Edits go to a draft; cancel always reverts to what is saved.
    const [draft, setDraft] = useState(null as any[] | null)
    const [saving, setSaving] = useState(false)
    const editing = draft !== null
    const dirty = editing && comparable(draft!) !== comparable(saved)
    const monthLabel = book ? formatMonthReport(book.month_report) : ''
    useUnsavedChangesWarning(dirty)

    useEffect(() => {
        if (monthLabel) document.title = 'สมุดเงินสดย่อย ' + monthLabel
    }, [monthLabel]);

    const save = async () => {
        if (!draft) return
        setSaving(true)
        try {
            await PettyCashApi.updateReporyByPettyCashId(id, draft)
            request.setData({ ...book, attributes: draft })
            setDraft(null)
            message.success('บันทึกการแก้ไขแล้ว')
        } catch (e) {
            message.error('บันทึกไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ')
        }
        setSaving(false)
    }

    const balance = saved.length > 0 ? saved[saved.length - 1].pettycash_total : 0
    const totals = pettyCashSummary({ attributes: saved })
    const headerExtra = editing
        ? <>
            <Button onClick={() => confirmDiscard(dirty, () => setDraft(null))} disabled={saving}>ยกเลิก</Button>
            <Button type='primary' onClick={save} loading={saving} disabled={!dirty}>บันทึกการแก้ไข</Button>
        </>
        : book ? <>
            <Button icon={<FileExcelOutlined />} onClick={() => generateExcel(AddPettyCashColumn, `สมุดเงินสดย่อย ${monthLabel}`, saved)}>ส่งออก Excel</Button>
            <Button type='primary' icon={<EditOutlined />} onClick={() => setDraft(saved)}>แก้ไข</Button>
        </> : null

    return <>
        <Prompt when={dirty} message={DISCARD_MESSAGE} />
        <HeaderComponent
            eyebrow='สมุดเงินสดย่อย'
            title={monthLabel ? `สมุดเงินสดย่อย ${monthLabel}` : 'สมุดเงินสดย่อย'}
            subTitle={book ? `${saved.length} รายการ · คงเหลือ ${formatMoney(balance)} บาท` : null}
            backPath='/PettyCashBook'
            extra={headerExtra}
        />
        <div className='page-body'>
            {request.error ? <LoadError error={request.error} onRetry={request.reload} /> : null}
            {request.loading && !book ? <Skeleton active paragraph={{ rows: 10 }} /> : null}
            {!request.loading && !request.error && !book ? <Empty description='ไม่พบสมุดเงินสดย่อยเดือนนี้' /> : null}
            {book && editing ? <Alert type='info' showIcon className='mb-16'
                message='โหมดแก้ไข: คลิกที่ช่องเพื่อแก้ไข — Tab ไปช่องถัดไป, Enter ไปแถวถัดไป ยอดคงเหลือคำนวณใหม่ทุกแถวอัตโนมัติ' /> : null}
            {book && !editing ? <div className='summary-strip'>
                <span className='summary-chip'><span className='summary-chip-value'>{totals.entries}</span> รายการ</span>
                <span className='summary-chip'><span className='summary-chip-label'>รับรวม</span><span className='summary-chip-value'>{formatMoney(totals.received)}</span> บาท</span>
                <span className='summary-chip'><span className='summary-chip-label'>จ่ายรวม</span><span className='summary-chip-value'>{formatMoney(totals.paid)}</span> บาท</span>
                <span className='summary-chip'><span className='summary-chip-label'>คงเหลือ</span><span className={'summary-chip-value' + (balance < 0 ? ' money-negative' : '')}>{formatMoney(balance)}</span> บาท</span>
            </div> : null}
            {book && !editing ? <Table
                columns={AddPettyCashColumn}
                dataSource={saved.map((row, index) => ({ ...row, key: index + 1 }))}
                bordered
                size='middle'
                pagination={false}
                scroll={{ x: 'max-content' }}
                sticky={stickyHeader}
            /> : null}
            {book && editing ? <EditableTable column={AddPettyCashColumn} getData={setDraft} oldData={draft!} showData={0} tableName='petty-cash' addable /> : null}
        </div>
    </>
}
