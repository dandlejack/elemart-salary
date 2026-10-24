import { Button, message, Modal, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ReportApi } from '../../api/ReportApi'
import { AddSalaryForm } from '../../components/AddSalaryForm/AddSalaryForm'
import { HeaderComponent } from '../../components/HeaderComponent'
import { LoadError } from '../../components/LoadError/LoadError'
import { confirmDelete, ReportSummary, salaryMonthColumns } from '../../mockData/mockColumnTable'
import { formatMonthReport, sortNewestFirst } from '../../utils/Month'
import { calcSalaryTotals, isNamelessRow } from '../../utils/Salary'
import { useRequest } from '../../utils/useRequest'
import { confirmDiscard } from '../../utils/confirmDiscard'
import { useUnsavedChangesWarning } from '../../utils/useUnsavedChangesWarning'

export const SaralyListPage: React.FC = () => {
    const { data, loading, error, reload: reloadList } = useRequest(async () => sortNewestFirst(await ReportApi.findSalaryList({})))
    const reports = data || []
    // People and totals per report; loaded separately (full reports are larger) so the list shows right away.
    const summaryRequest = useRequest(async () => {
        const summaries: { [reportId: string]: ReportSummary } = {}
        const all: any[] = await ReportApi.findAllReports({})
        all.forEach(report => {
            const rows = (report.attributes || []).filter((row: any) => !isNamelessRow(row))
            summaries[report.report_id] = {
                people: rows.length,
                gross: rows.reduce((total: number, row: any) => total + calcSalaryTotals(row).gross, 0),
                net: rows.reduce((total: number, row: any) => total + calcSalaryTotals(row).net, 0),
            }
        })
        return summaries
    })
    const reload = () => { reloadList(); summaryRequest.reload() }
    // The dashboard links here with { create: true } to start a new report right away.
    const location = useLocation<{ create?: boolean } | undefined>()
    const [creating, setCreating] = useState(!!(location.state && location.state.create))
    const [formDirty, setFormDirty] = useState(false)
    useUnsavedChangesWarning(creating && formDirty)
    useEffect(() => {
        document.title = 'รายงานเงินเดือน'
    }, []);

    const deleteReport = (record: any) => confirmDelete(
        <>ลบรายงานเงินเดือน <b>{formatMonthReport(record.month_report)}</b>?</>,
        'ข้อมูลเงินเดือนของพนักงานทุกคนในรายงานนี้จะถูกลบ และกู้คืนไม่ได้',
        async () => {
            try {
                await ReportApi.deleteReportById(record.report_id)
                message.success(`ลบรายงาน ${formatMonthReport(record.month_report)} แล้ว`)
                reload()
            } catch (e) {
                message.error('ลบไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ')
            }
        })

    return <>
        <HeaderComponent title='รายงานเงินเดือน' extra={<Button type='primary' icon={<PlusOutlined />} onClick={() => setCreating(true)}>สร้างรายงานเงินเดือน</Button>} />
        <div className='page-body'>
            {error ? <LoadError error={error} onRetry={reload} /> : null}
            {error && !data ? null : <>
                <Table
                    rowKey='report_id'
                    columns={salaryMonthColumns(deleteReport, summaryRequest.error ? {} : summaryRequest.data)}
                    dataSource={reports}
                    loading={loading}
                    size='middle'
                    pagination={{ pageSize: 12, showSizeChanger: false, showTotal: total => `ทั้งหมด ${total} รายงาน` }}
                    locale={{ emptyText: 'ยังไม่มีรายงานเงินเดือน' }}
                    scroll={{ x: 820 }}
                />
            </>}
        </div>
        <Modal title='สร้างรายงานเงินเดือน' visible={creating} footer={null} onCancel={() => confirmDiscard(formDirty, () => setCreating(false))} destroyOnClose width='95%' style={{ maxWidth: 1400, top: 24 }}>
            <AddSalaryForm existingMonths={reports.map(r => r.month_report)} onDirtyChange={setFormDirty} onDone={() => { setFormDirty(false); setCreating(false); reload() }} />
        </Modal>
    </>
}
