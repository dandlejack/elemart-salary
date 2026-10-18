import React, { useState } from 'react'
import { Alert, Button, DatePicker, message, Modal, Progress, Space, Typography } from 'antd'
import { FilePdfOutlined } from '@ant-design/icons'
import moment from 'moment'
import { ReportApi } from '../../api/ReportApi'
import { defaultPayDate, formatMonthReport, formatThaiDate } from '../../utils/Month'
import { isNamelessRow } from '../../utils/Salary'
import { savePayslipsPdf } from './payslipPdf'

interface Props {
    reportId: string
    monthReport: string
    rows: any[]
}

// Downloads every employee's payslip for one report as a single PDF (one payslip per page).
export const MonthPayslipsButton: React.FC<Props> = ({ reportId, monthReport, rows }) => {
    const [open, setOpen] = useState(false)
    const [payDate, setPayDate] = useState(null as moment.Moment | null)
    const [progress, setProgress] = useState(null as { done: number, total: number, stage: string } | null)
    const employees = rows.filter(row => !isNamelessRow(row))

    const start = () => {
        setPayDate(defaultPayDate(monthReport))
        setProgress(null)
        setOpen(true)
    }

    const generate = async () => {
        if (!payDate) return
        try {
            setProgress({ done: 0, total: employees.length, stage: 'กำลังโหลดยอดสะสม' })
            const slips = await Promise.all(employees.map(async row => ({
                fullname: row.fullname,
                row,
                payDate: formatThaiDate(payDate),
                totals: await ReportApi.findSumLateAndSecuritySocial({ report_id: reportId, employees_id: row.employees_id, fullname: row.fullname }),
            })))
            await savePayslipsPdf(slips, `สลิปเงินเดือน ${formatMonthReport(monthReport)}.pdf`,
                (done, total) => setProgress({ done, total, stage: 'กำลังสร้างสลิป' }))
            message.success(`ดาวน์โหลดสลิป ${employees.length} คนแล้ว`)
            setOpen(false)
        } catch (e) {
            message.error('สร้างสลิปไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่')
        }
        setProgress(null)
    }

    const busy = progress !== null
    return <>
        <Button icon={<FilePdfOutlined />} onClick={start} disabled={employees.length === 0}>สลิปทั้งเดือน (PDF)</Button>
        <Modal
            title={`ดาวน์โหลดสลิปเงินเดือน ${formatMonthReport(monthReport)}`}
            visible={open}
            okText={`สร้าง PDF ${employees.length} คน`}
            cancelText='ยกเลิก'
            onOk={generate}
            okButtonProps={{ loading: busy, disabled: !payDate }}
            cancelButtonProps={{ disabled: busy }}
            closable={!busy}
            maskClosable={!busy}
            onCancel={() => setOpen(false)}
        >
            <Space direction='vertical' style={{ width: '100%' }}>
                <Space>
                    <span>วันที่จ่าย</span>
                    <DatePicker value={payDate} onChange={setPayDate} format={(value: moment.Moment) => formatThaiDate(value)} allowClear={false} disabled={busy} />
                </Space>
                <Typography.Text type='secondary'>ได้ไฟล์ PDF ไฟล์เดียว 1 หน้าต่อ 1 คน เรียงตามลำดับในรายงาน</Typography.Text>
                {rows.length !== employees.length ? <Alert type='info' showIcon message={`ไม่รวม ${rows.length - employees.length} แถวที่ไม่มีชื่อพนักงาน`} /> : null}
                {progress ? <div>
                    <div>{progress.stage}… {progress.done}/{progress.total}</div>
                    <Progress percent={progress.total ? Math.round(progress.done / progress.total * 100) : 0} />
                </div> : null}
            </Space>
        </Modal>
    </>
}
