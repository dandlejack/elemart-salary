import { Alert, Button, Empty, Input, message, Skeleton, Table, Typography } from 'antd'
import { EditOutlined, FileExcelOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import { Prompt } from 'react-router-dom'
import { ReportApi } from '../../api/ReportApi'
import { HeaderComponent } from '../../components/HeaderComponent'
import { AddSalaryColumn } from '../../mockData/mockColumnTable'
import { generateExcel } from '../../components/Excel/ExcelComponent'
import { EditableTable } from '../../components/EditTable/EditableTable'
import { LoadError } from '../../components/LoadError/LoadError'
import { MonthPayslipsButton } from '../../components/Payslip/MonthPayslipsButton'
import { salarySummary } from '../../components/SalarySummary/SalarySummary'
import { calcSalaryTotals, formatMoney, isNamelessRow, normalizeName } from '../../utils/Salary'
import { formatMonthReport } from '../../utils/Month'
import { stickyHeader } from '../../utils/TableLayout'
import { useRequest } from '../../utils/useRequest'
import { confirmDiscard, DISCARD_MESSAGE } from '../../utils/confirmDiscard'
import { useUnsavedChangesWarning } from '../../utils/useUnsavedChangesWarning'

// Row content without UI-only fields, to tell whether the draft differs from what is saved.
const comparable = (rows: any[]) => JSON.stringify((rows || []).map(({ operation, key, _textCells, ...row }: any) => row))

export const SalaryInfoPage: React.FC<{ match: any }> = ({ match }) => {
    const { id } = match.params
    const request = useRequest(() => ReportApi.findReportById(id), [id])
    const report = request.data
    const saved: any[] = report ? report.attributes : []
    // Edits go to a draft; the saved rows only change after a successful save, so cancel always reverts.
    const [draft, setDraft] = useState(null as any[] | null)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')
    const editing = draft !== null
    const dirty = editing && comparable(draft!) !== comparable(saved)
    const monthLabel = report ? formatMonthReport(report.month_report) : ''
    useUnsavedChangesWarning(dirty)

    useEffect(() => {
        if (monthLabel) document.title = 'เงินเดือน ' + monthLabel
    }, [monthLabel]);

    const startEdit = (rows: any[] = saved) => setDraft(rows)
    const cancelEdit = () => confirmDiscard(dirty, () => setDraft(null))

    const save = async () => {
        if (!draft) return
        const attributes = draft.map(({ operation, _textCells, ...row }: any) => row)
        setSaving(true)
        try {
            const ok = await ReportApi.updateReportByReportID(id, { attributes })
            if (!ok) throw new Error('not saved')
            request.setData({ ...report, attributes })
            setDraft(null)
            message.success('บันทึกการแก้ไขแล้ว')
        } catch (e) {
            message.error('บันทึกการแก้ไขไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่')
        }
        setSaving(false)
    }

    const exportExcel = () => generateExcel(
        AddSalaryColumn,
        monthLabel,
        saved.filter(row => !isNamelessRow(row)).map((row: any) => ({ ...row, net: calcSalaryTotals(row).net }))
    )

    const namelessRows = saved.filter(isNamelessRow)
    const employees = saved.filter(row => !isNamelessRow(row))
    const netTotal = employees.reduce((total, row) => total + calcSalaryTotals(row).net, 0)
    const shownRows = search.trim() === ''
        ? saved
        : saved.filter((row: any) => normalizeName(row.fullname || '').includes(normalizeName(search)))

    const headerExtra = editing
        ? <>
            <Button onClick={cancelEdit} disabled={saving}>ยกเลิก</Button>
            <Button type='primary' onClick={save} loading={saving} disabled={!dirty}>บันทึกการแก้ไข</Button>
        </>
        : report ? <>
            <MonthPayslipsButton reportId={id} monthReport={report.month_report} rows={saved} />
            <Button icon={<FileExcelOutlined />} onClick={exportExcel}>ส่งออก Excel</Button>
            <Button type='primary' icon={<EditOutlined />} onClick={() => startEdit()}>แก้ไข</Button>
        </> : null

    return <>
        <Prompt when={dirty} message={DISCARD_MESSAGE} />
        <HeaderComponent
            title={monthLabel ? `เงินเดือน ${monthLabel}` : 'รายงานเงินเดือน'}
            subTitle={report ? `${employees.length} คน · ยอดสุทธิ ${formatMoney(netTotal)} บาท` : null}
            backPath='/salary-list'
            extra={headerExtra}
        />
        <div className='page-body'>
            {request.error ? <LoadError error={request.error} onRetry={request.reload} /> : null}
            {request.loading && !report ? <Skeleton active paragraph={{ rows: 10 }} /> : null}
            {!request.loading && !request.error && !report ? <Empty description='ไม่พบรายงานนี้' /> : null}
            {report && !editing && namelessRows.length > 0 ? <Alert
                type='warning'
                showIcon
                style={{ marginBottom: 16 }}
                message={`พบ ${namelessRows.length} แถวที่ไม่มีชื่อพนักงาน (แถวสีส้ม)`}
                description='น่าจะเป็นแถวยอดรวมที่ติดมาจากไฟล์ Excel ตอนนำเข้า — ยอดรวม สลิป และไฟล์ Excel ที่ส่งออกไม่นับแถวเหล่านี้แล้ว แนะนำให้ลบออกจากรายงาน'
                action={<Button size='small' onClick={() => startEdit(saved.filter(row => !isNamelessRow(row)))}>ลบแถวเหล่านี้</Button>}
            /> : null}
            {report && editing ? <Alert
                type='info'
                showIcon
                style={{ marginBottom: 16 }}
                message='โหมดแก้ไข: คลิกที่ช่องเพื่อแก้ไข — Tab ไปช่องถัดไป, Enter ไปแถวถัดไป, Esc ยกเลิกช่องนั้น'
                description={dirty ? 'มีการแก้ไขที่ยังไม่ได้บันทึก กด "บันทึกการแก้ไข" ด้านบนเมื่อเสร็จ' : null}
            /> : null}
            {report && !editing ? <div className='page-toolbar'>
                <Input.Search allowClear placeholder='ค้นหาชื่อ' style={{ width: 260 }} onChange={e => setSearch(e.target.value)} />
                {search ? <Typography.Text type='secondary'>พบ {shownRows.length} คน</Typography.Text> : null}
            </div> : null}
            {report && !editing ?
                <Table
                    rowKey={(row: any) => String(row.key) + row.fullname}
                    columns={AddSalaryColumn}
                    dataSource={shownRows}
                    bordered
                    size='middle'
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                    sticky={stickyHeader}
                    summary={salarySummary(AddSalaryColumn)}
                    rowClassName={(row: any) => isNamelessRow(row) ? 'row-warning' : ''}
                /> : null}
            {report && editing ?
                <EditableTable column={AddSalaryColumn} getData={setDraft} oldData={draft!} showData={0} tableName='salary-table' summary={salarySummary(AddSalaryColumn)} rowClassName={(row: any) => isNamelessRow(row) ? 'row-warning' : ''} />
                : null}
        </div>
    </>
}
