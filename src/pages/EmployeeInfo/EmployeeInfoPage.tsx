import { Alert, Button, Card, DatePicker, Empty, Form, InputNumber, message, Modal, Select, Skeleton, Space, Typography } from "antd";
import { DownloadOutlined, EditOutlined } from "@ant-design/icons";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { EmployeeApi, isResigned } from "../../api/EmployeeApi";
import { ReportApi } from "../../api/ReportApi";
import { HeaderComponent } from "../../components/HeaderComponent";
import { LoadError } from "../../components/LoadError/LoadError";
import { StatusTag } from "../../components/StatusTag/StatusTag";
import { Payslip, PAYSLIP_WIDTH, ScaledPreview } from "../../components/Payslip/Payslip";
import { savePayslipsPdf } from "../../components/Payslip/payslipPdf";
import { calcSocialSecurity, formatMoney, normalizeName } from '../../utils/Salary'
import { defaultPayDate, formatMonthReport, formatThaiDate, sortNewestFirst } from "../../utils/Month";
import { useRequest } from "../../utils/useRequest";
import { ITotalSocialAndLate } from "../../types/StoreTypes";

const emptyTotals: ITotalSocialAndLate = {
    total_security_social: 0,
    total_late: 0,
    total_absent: 0,
    total_lending: 0,
    total_fund: 0
}

export const EmployeeInfoPage: React.FC<{ match: any }> = ({ match }) => {
    const { id } = match.params;
    const [reportId, setReportId] = useState('')
    const [payDate, setPayDate] = useState(null as moment.Moment | null)
    const [downloading, setDownloading] = useState(false)
    const [editingSalary, setEditingSalary] = useState(false)
    const [newSalary, setNewSalary] = useState(null as number | null)
    const [savingSalary, setSavingSalary] = useState(false)

    const employeeRequest = useRequest(async () => {
        const employee = await EmployeeApi.findEmployeeByEmployeeId(id)
        if (!employee) return { employee: null, reports: [] }
        const name = employee.fullname || employee.firstname + ' ' + employee.lastname
        // Reports created before employees_id was stored can only be matched by name.
        const reports = sortNewestFirst(await ReportApi.findSalaryList({ employees_id: id, fullname: name }))
        return { employee, reports }
    }, [id])
    const employee = employeeRequest.data?.employee
    const reports = employeeRequest.data?.reports || []
    const fullname = employee ? (employee.fullname || employee.firstname + ' ' + employee.lastname) : ''
    const report = reports.find(r => r.report_id === reportId)

    useEffect(() => {
        if (fullname) document.title = fullname
    }, [fullname]);

    // Open the latest payslip by default.
    useEffect(() => {
        if (reports.length > 0 && !reports.some(r => r.report_id === reportId)) changeMonth(reports[0].report_id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reports]);

    const slipRequest = useRequest(async () => {
        if (!reportId || !fullname) return null
        const [full, totals] = await Promise.all([
            ReportApi.findReportById(reportId),
            ReportApi.findSumLateAndSecuritySocial({ report_id: reportId, employees_id: id, fullname }),
        ])
        const row = full && full.attributes.find((a: any) => a.employees_id === id || normalizeName(a.fullname) === normalizeName(fullname))
        return { row: row || null, totals: totals || emptyTotals }
    }, [reportId, id, fullname])

    const changeMonth = (selectedReportId: string) => {
        const selected = reports.find(d => d.report_id === selectedReportId)
        setReportId(selectedReportId)
        setPayDate(selected ? defaultPayDate(selected.month_report) : null)
    }

    const slip = slipRequest.data && slipRequest.data.row ? {
        fullname,
        row: slipRequest.data.row,
        totals: slipRequest.data.totals,
        payDate: payDate ? formatThaiDate(payDate) : '',
    } : null

    const downloadPdf = async () => {
        if (!slip || !report) return
        setDownloading(true)
        try {
            await savePayslipsPdf([slip], `${fullname} ${formatMonthReport(report.month_report)}.pdf`)
        } catch (e) {
            message.error('สร้างไฟล์ PDF ไม่สำเร็จ')
        }
        setDownloading(false)
    }

    const updateSalary = async () => {
        if (!newSalary || newSalary <= 0) {
            message.error('กรุณากรอกเงินเดือนให้ถูกต้อง')
            return
        }
        setSavingSalary(true)
        try {
            await EmployeeApi.updateEmployeeByEmployeeId(id, { current_salary: newSalary, social_security: calcSocialSecurity(newSalary) })
            message.success('บันทึกเงินเดือนใหม่แล้ว')
            setEditingSalary(false)
            employeeRequest.reload()
        } catch (e) {
            message.error('บันทึกไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ')
        }
        setSavingSalary(false)
    }

    const header = <HeaderComponent
        eyebrow='พนักงาน'
        title={fullname || 'ข้อมูลพนักงาน'}
        subTitle={employee ? <Space size={8}>
            <StatusTag resigned={isResigned(employee)} />
            <span>เงินเดือนปัจจุบัน {employee.current_salary !== undefined && employee.current_salary !== null ? formatMoney(employee.current_salary) + ' บาท' : '-'}</span>
        </Space> : null}
        backPath='/employee'
        extra={employee ? <Button icon={<EditOutlined />} onClick={() => { setNewSalary(employee.current_salary || null); setEditingSalary(true) }}>แก้ไขเงินเดือน</Button> : null}
    />

    if (employeeRequest.error) return <>{header}<div className='page-body'><LoadError error={employeeRequest.error} onRetry={employeeRequest.reload} /></div></>
    if (employeeRequest.loading && !employeeRequest.data) return <>{header}<div className='page-body'><Skeleton active /></div></>
    if (!employee) return <>{header}<div className='page-body'><Empty description='ไม่พบพนักงานคนนี้' /></div></>

    return <>
        {header}
        <div className='page-body'>
            {reports.length === 0 ? <Empty description='ยังไม่มีสลิปเงินเดือนของพนักงานคนนี้' /> : <>
                <div className='page-toolbar'>
                    <Space>
                        <span>สลิปเดือน</span>
                        <Select value={reportId || undefined} onChange={(val: string) => changeMonth(val)} className='toolbar-select' showSearch optionFilterProp='children'>
                            {reports.map(data => <Select.Option key={data.report_id} value={data.report_id}>{formatMonthReport(data.month_report)}</Select.Option>)}
                        </Select>
                    </Space>
                    <Space>
                        <span>วันที่จ่าย</span>
                        <DatePicker value={payDate} onChange={setPayDate} format={(value: moment.Moment) => formatThaiDate(value)} allowClear={false} />
                    </Space>
                    <div className='page-toolbar-spacer' />
                    <Button type='primary' icon={<DownloadOutlined />} disabled={!slip} loading={downloading} onClick={downloadPdf}>ดาวน์โหลดสลิป PDF</Button>
                </div>
                {slipRequest.error ? <LoadError error={slipRequest.error} onRetry={slipRequest.reload} /> : null}
                {slipRequest.loading ? <Skeleton active paragraph={{ rows: 8 }} /> : null}
                {!slipRequest.loading && slipRequest.data && !slipRequest.data.row
                    ? <Alert type='warning' showIcon message='ไม่พบข้อมูลเงินเดือนของพนักงานคนนี้ในเดือนที่เลือก' /> : null}
                {!slipRequest.loading && slip ? <Card className='payslip-sheet'>
                    <ScaledPreview width={PAYSLIP_WIDTH}><Payslip {...slip} /></ScaledPreview>
                </Card> : null}
            </>}
        </div>
        <Modal
            title='แก้ไขเงินเดือน'
            visible={editingSalary}
            okText='บันทึก'
            cancelText='ยกเลิก'
            confirmLoading={savingSalary}
            onOk={updateSalary}
            onCancel={() => setEditingSalary(false)}
            destroyOnClose
        >
            <Form layout='vertical'>
                <Form.Item label='เงินเดือนใหม่ (บาท)' extra={newSalary ? `ประกันสังคมที่ระบบคำนวณ: ${formatMoney(calcSocialSecurity(newSalary))} บาท` : null}>
                    <InputNumber autoFocus min={0} className='full-width' value={newSalary as any} onChange={(v: any) => setNewSalary(v)} onPressEnter={updateSalary}
                        formatter={(v: any) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(v: any) => (v || '').replace(/,/g, '')} />
                </Form.Item>
                <Typography.Text type='secondary'>มีผลกับเงินเดือนปัจจุบันของพนักงานเท่านั้น รายงานเงินเดือนที่บันทึกไปแล้วไม่เปลี่ยน</Typography.Text>
            </Form>
        </Modal>
    </>
}
