import { Alert, Button, InputNumber, notification, Select, Statistic, Switch } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { EmployeeApi } from "../../api/EmployeeApi";
import { ReportApi } from "../../api/ReportApi";
import { HeaderComponent } from "../../components/HeaderComponent";
import logo from '../../images/logo-com.png'
import { AddComma } from '../../utils/AddComma'
import { calcSalaryTotals, calcSocialSecurity, formatMoney, normalizeName } from '../../utils/Salary'
import { IReportMonthList, IEmployeeProps, ITotalSocialAndLate } from "../../types/StoreTypes";
import { GeneratePDF } from "../../components/GeneratePDF/GeneratePDF";

const monthVal = [
    { key: '01', value: 'ม.ค.' },
    { key: '02', value: 'ก.พ.' },
    { key: '03', value: 'มี.ค.' },
    { key: '04', value: 'เม.ย.' },
    { key: '05', value: 'พ.ค.' },
    { key: '06', value: 'มิ.ย.' },
    { key: '07', value: 'ก.ค.' },
    { key: '08', value: 'ส.ค.' },
    { key: '09', value: 'ก.ย.' },
    { key: '10', value: 'ต.ค.' },
    { key: '11', value: 'พ.ย.' },
    { key: '12', value: 'ธ.ค.' },
]

// "03/2026" (or "12/2025-bonus") -> "มี.ค. 2569"
const toThaiMonth = (monthReport: string) => {
    const [monthNum, year] = monthReport.split('/')
    const month = monthVal.find(d => d.key === monthNum)
    const thaiYear = parseInt(year) + 543
    return month && !isNaN(thaiYear) ? month.value + ' ' + thaiYear : monthReport
}

const emptyTotals: ITotalSocialAndLate = {
    total_security_social: 0,
    total_late: 0,
    total_absent: 0,
    total_lending: 0,
    total_fund: 0
}

export const EmployeeInfoPage: React.FC<{ match: any }> = ({ match }) => {
    const { id } = match.params;
    const ref = useRef<HTMLDivElement>(null)
    const [reportMonthList, setReportMonthList] = useState([] as Array<IReportMonthList>)
    const [dataSource, setDataSource] = useState({} as IEmployeeProps)
    const [reportId, setReportId] = useState('')
    // Salary row of this employee in the selected report; null when the report has no row for them.
    const [reportRow, setReportRow] = useState(null as any)
    const [reportThaiMonth, setReportThaiMonth] = useState('')
    const [totalSocialandLate, setTotalSocialandLate] = useState(emptyTotals);
    const [currentSalary, setCurrentSalary] = useState(null as number | null)
    const [editable, setEditable] = useState(false)
    const fullname = dataSource.fullname || (dataSource.firstname ? dataSource.firstname + ' ' + dataSource.lastname : '')

    useEffect(() => {
        const getData = async () => {
            const employee = await EmployeeApi.findEmployeeByEmployeeId(id)
            if (!employee) return
            setDataSource(employee)
            const name = employee.fullname || employee.firstname + ' ' + employee.lastname
            document.title = name
            // Reports created before employees_id was stored can only be matched by name.
            const reports = await ReportApi.findSalaryList({ employees_id: id, fullname: name })
            setReportMonthList(reports || [])
        }
        getData()
    }, [id]);

    useEffect(() => {
        if (!reportId || !fullname) return
        let cancelled = false
        setReportRow(null)
        setTotalSocialandLate(emptyTotals)
        ReportApi.findReportById(reportId).then(report => {
            if (cancelled) return
            const row = report && report.attributes.find((a: any) => a.employees_id === id || normalizeName(a.fullname) === normalizeName(fullname))
            setReportRow(row || null)
        })
        ReportApi.findSumLateAndSecuritySocial({ report_id: reportId, employees_id: id, fullname }).then(res => {
            if (!cancelled && res) setTotalSocialandLate(res)
        })
        return () => {
            cancelled = true
        };
    }, [reportId, id, fullname]);

    const changeMonth = (selectedReportId: string) => {
        const report = reportMonthList.find(d => d.report_id === selectedReportId)
        setReportId(selectedReportId)
        setReportThaiMonth(report ? toThaiMonth(report.month_report) : '')
    }

    const updateSalary = () => {
        if (!currentSalary || currentSalary <= 0) {
            notification.error({ message: 'กรุณากรอกเงินเดือนให้ถูกต้อง', duration: 3 })
            return
        }
        const data = {
            current_salary: currentSalary,
            social_security: calcSocialSecurity(currentSalary)
        }
        EmployeeApi.updateEmployeeByEmployeeId(id, data)
    }

    const field = (key: string) => reportRow ? formatMoney(reportRow[key]) : ''
    // Payslips before the fund started (no fund value stored) keep their original layout.
    const showFund = reportRow !== null && reportRow.fund !== undefined && reportRow.fund !== null
    const totals = reportRow ? calcSalaryTotals(reportRow) : null
    const summaryOfTotal = {
        gross_total: totals ? AddComma(totals.gross) : '',
        deuction_total: totals ? AddComma(totals.deductions) : '',
        total: totals ? AddComma(totals.net) : ''
    }

    return <div style={{ marginBottom: 50 }}>
        <HeaderComponent title='Employee Info' nameOfLinkPath='' />
        <div style={{ width: '100%', marginTop: 15, marginRight: 10, position: 'relative' }}>
            {reportRow ? <GeneratePDF document={document.getElementById('page-pdf')} fullname={fullname} reportMonth={reportThaiMonth} /> : <></>}
        </div>
        <div style={{ marginLeft: 15 }} className='space-between-component'>
            <Switch checkedChildren='ยกเลิก' unCheckedChildren='แก้ไข' onChange={e => setEditable(!editable)} />
        </div>
        <div style={{ marginLeft: 15 }} className='space-between-component'>
            <Statistic title="เงินเดือนปัจจุบัน" value={dataSource.current_salary !== undefined && dataSource.current_salary !== null ? AddComma(dataSource.current_salary) + " บาท" : '-'} />
        </div>
        {editable ? <div style={{ marginLeft: 15 }} className='space-between-component'>
            <InputNumber style={{width:150}} min={0} onChange={(salary: number) => setCurrentSalary(salary)} /> <Button type='primary' onClick={updateSalary}>Update</Button>
        </div> : <></>}
        <div style={{ marginLeft: 15 }} className='space-between-component'>
            <Select onChange={(val: string) => changeMonth(val)} style={{ width: 150 }} >
                {reportMonthList.map(data => {
                    return <Select.Option key={data.report_id} value={data.report_id}>{data.month_report}</Select.Option>
                })}
            </Select>
        </div>
        {reportId && reportRow === null ? <div style={{ marginLeft: 15, width: 400 }} className='space-between-component'>
            <Alert type='warning' showIcon message='ไม่พบข้อมูลเงินเดือนของพนักงานคนนี้ในเดือนที่เลือก' />
        </div> : <></>}


        <div style={{ width: 1280, margin: '50px auto', position: 'relative' }} id='page-pdf' ref={ref}>
            <div className='space-between-component' style={{marginBottom:'0.2cm'}}>
                <img className='company-logo' src={logo} />
                <div style={{ fontSize: 18, marginTop: 10, fontWeight: 'bolder' }} className='A4-Font'>
                    <h4>ELE-MART CO., LTD.</h4>
                    <span>62,63 Phraya Suren Rd, Bang Chan, Khlong Sam Wa, Bangkok 10510</span>
                </div>
            </div>
            <div className='space-between-component1' style={{ width: '100%' }}>
                <span className='A4-Font' style={{ marginRight: 15 }}>ชื่อ-สกุล</span>
                <span className='A4-Font' >{fullname}</span>
                <span className='A4-Font' style={{ float: 'right' }}>{reportThaiMonth ? '25 ' + reportThaiMonth : ''}</span>
                <span className='A4-Font' style={{ marginRight: 15, float: 'right' }}>วันที่จ่าย </span>
            </div>
            <div className='space-between-component'>
            </div>
            <table className='description-table space-between-component A4-Font'>
                <tr >
                    <th></th>
                    <th></th>
                </tr>
                <tr style={{ borderTop: '3px solid #000' }}>
                    <th style={{ fontSize: '1.7rem', fontWeight: 'bold' }} colSpan={2}>รายได้(Income)</th>
                    <th style={{ fontSize: '1.7rem', fontWeight: 'bold' }} colSpan={2}>รายการหัก(Deduction)</th>
                    <th style={{ fontWeight: 'bold' }} colSpan={2}></th>

                </tr>
                <tr>
                    <td>เงินเดือน</td>
                    <td>{field('salary')}</td>
                    <td>ภาษีเงินได้</td>
                    <td>-{field('tax')}</td>
                    <td>รวมเงินได้</td>
                    <td>{summaryOfTotal.gross_total}</td>
                </tr>
                <tr>
                    <td>โอที</td>
                    <td>{field('overtime')}</td>
                    <td>ประกันสังคม</td>
                    <td>-{field('social_security')}</td>
                    <td>รวมเงินหัก</td>
                    <td>-{summaryOfTotal.deuction_total}</td>
                </tr>
                <tr>
                    <td>เบี้ยเลี้ยง</td>
                    <td>{field('allowance')}</td>
                    <td>มาสาย</td>
                    <td>-{field('late')}</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td>น้ำมัน</td>
                    <td>{field('fuel')}</td>
                    <td>ขาด</td>
                    <td>-{field('absent')}</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td>นายหน้า</td>
                    <td>{field('agent')}</td>
                    <td>ภาษีนายหน้า</td>
                    <td>-{field('agent_tax')}</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td>โบนัส</td>
                    <td>{field('bonus')}</td>
                    <td>ภาษีโบนัส</td>
                    <td>-{field('bonus_tax')}</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td>เงินกู้,เงินยืมบริษัท</td>
                    <td>-{field('lending')}</td>
                    <td></td>
                    <td></td>
                </tr>
                {showFund ? <tr>
                    <td></td>
                    <td></td>
                    <td>กองทุน</td>
                    <td>-{field('fund')}</td>
                    <td></td>
                    <td></td>
                </tr> : null}
                <tr>
                    <td >รวมรายได้</td>
                    <td >{summaryOfTotal.gross_total}</td>
                    <td>รวมรายการหัก</td>
                    <td >-{summaryOfTotal.deuction_total}</td>
                    <td>เงินได้สุทธิ</td>
                    <td >{summaryOfTotal.total}</td>
                </tr>
            </table>
            <div>
                <span className='A4-Font' style={{ marginRight: 7, fontWeight: 'bolder' }}>*ประกันสังคมสะสม : {formatMoney(totalSocialandLate.total_security_social)} </span>
                <span className='A4-Font' style={{ marginRight: 7, fontWeight: 'bolder' }}>*มาสายสะสม : {formatMoney(totalSocialandLate.total_late)} </span>
                <span className='A4-Font' style={{ marginRight: 7, fontWeight: 'bolder' }}>*ขาดสะสม : {formatMoney(totalSocialandLate.total_absent)} </span>
                <span className='A4-Font' style={{ marginRight: 7, fontWeight: 'bolder' }}>*เงินยืมที่จ่าย : {formatMoney(totalSocialandLate.total_lending)} </span>
                {showFund ? <span className='A4-Font' style={{ marginRight: 7, fontWeight: 'bolder' }}>*กองทุนสะสม : {formatMoney(totalSocialandLate.total_fund)} </span> : null}
            </div>
            {/* <div style={{ textAlign: 'right', marginTop: 15 }}>
                <div>
                    <span style={{ fontSize: '1.5rem' }}>______________________</span>

                </div>
                <div >
                    <span style={{ paddingRight: 25, fontSize: '1.2rem' }}>(นายเทพไชย วราวุฒิ)</span>
                </div>
                <div>
                    <span style={{ paddingRight: 43, fontSize: '1.2rem' }}>กรรมการผู้จัดการ</span>
                </div>
            </div> */}
        </div>

    </div>
}
