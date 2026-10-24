import React, { useEffect, useMemo } from 'react'
import { Button, Card, Col, Empty, Row, Skeleton, Table } from 'antd'
import { ArrowDownOutlined, ArrowUpOutlined, CheckOutlined, FileTextOutlined, PlusOutlined, RightOutlined, SafetyCertificateOutlined, TeamOutlined, WalletOutlined } from '@ant-design/icons'
import { Link, useHistory } from 'react-router-dom'
import { HeaderComponent } from '../../components/HeaderComponent'
import { LoadError } from '../../components/LoadError/LoadError'
import { MonthlyBarChart } from '../../components/Chart/MonthlyBarChart'
import { EmployeeApi, isResigned } from '../../api/EmployeeApi'
import { ReportApi } from '../../api/ReportApi'
import { useRequest } from '../../utils/useRequest'
import { currentMonthReport, formatMonthReport, parseMonthReport, sortNewestFirst, THAI_MONTHS } from '../../utils/Month'
import { MonthTotals, percentChange, totalsByMonth } from '../../utils/Dashboard'
import { calcSalaryTotals, formatMoney, isNamelessRow } from '../../utils/Salary'

const CHART_MONTHS = 12
const RECENT_REPORTS = 6

// "10/2026" -> "ต.ค. 69"
const shortMonth = (month: string) => {
    const { year, month: m } = parseMonthReport(month)
    return `${THAI_MONTHS[m - 1]} ${String(year + 543).slice(-2)}`
}

// Neutral colour on purpose: payroll going up or down is neither good nor bad.
const Delta: React.FC<{ change: number | null, previousLabel: string }> = ({ change, previousLabel }) => {
    if (change === null) return <span className='kpi-sub'>ไม่มีเดือนก่อนหน้าให้เทียบ</span>
    const up = change >= 0
    return <span className='kpi-sub'>
        {up ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(change).toFixed(1)}% จาก {previousLabel}
    </span>
}

const KpiCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number, unit: string, sub: React.ReactNode }> = ({ icon, label, value, unit, sub }) =>
    <div className='kpi-card'>
        <span className='kpi-icon'>{icon}</span>
        <span className='kpi-label'>{label}</span>
        <span className='kpi-value'>{value}<span className='kpi-unit'>{unit}</span></span>
        {sub}
    </div>

// The month's payroll steps. Only step 01 has a known state (this month's report exists);
// the others just open the report, since the app does not record whether they were done.
const MonthWorkflow: React.FC<{ reportPath: string | null, onCreate: () => void }> = ({ reportPath, onCreate }) => {
    const done = reportPath !== null
    const steps = ['ตรวจสอบและแก้ไข', 'ออกสลิปเงินเดือน', 'ส่งออก Excel']
    return <section className='workflow' aria-label='ขั้นตอนประจำเดือน'>
        <span className='eyebrow'>ขั้นตอนประจำเดือน</span>
        <ol className='workflow-list'>
            <li>
                {done
                    ? <Link className='workflow-step is-done' to={reportPath!}>
                        <span className='workflow-badge' aria-hidden><CheckOutlined /></span>
                        <span className='workflow-title'>สร้าง/นำเข้ารายงาน</span>
                        <span className='workflow-state'>เสร็จแล้ว</span>
                    </Link>
                    : <button type='button' className='workflow-step' onClick={onCreate}>
                        <span className='workflow-badge'>01</span>
                        <span className='workflow-title'>สร้าง/นำเข้ารายงาน</span>
                        <RightOutlined className='workflow-arrow' />
                    </button>}
            </li>
            {steps.map((title, index) => {
                const badge = <span className='workflow-badge'>{`0${index + 2}`}</span>
                return <li key={title}>
                    {done
                        ? <Link className='workflow-step' to={reportPath!}>
                            {badge}
                            <span className='workflow-title'>{title}</span>
                            <RightOutlined className='workflow-arrow' />
                        </Link>
                        : <span className='workflow-step is-disabled' aria-disabled>
                            {badge}
                            <span className='workflow-title'>{title}</span>
                        </span>}
                </li>
            })}
        </ol>
    </section>
}

export const DashboardPage: React.FC = () => {
    const history = useHistory()
    useEffect(() => {
        document.title = 'ภาพรวม'
    }, []);

    const { data, loading, error, reload } = useRequest(async () => {
        const [list, employees] = await Promise.all([ReportApi.findSalaryList({}), EmployeeApi.findAllEmployees()])
        const recent = sortNewestFirst(list)
        // Enough reports for 12 calendar months, including extra runs (bonus, round 2).
        const months = Array.from(new Set(recent.map(r => r.month_report.slice(0, 7)))).slice(0, CHART_MONTHS + 1)
        const wanted = recent.filter(r => months.includes(r.month_report.slice(0, 7)))
        const reports = wanted.length > 0
            ? await ReportApi.findAllReports({ filterObject: { report_id: { $in: wanted.map(r => r.report_id) } } })
            : []
        return { list: recent, employees, reports: sortNewestFirst(reports as any[]) }
    })

    const monthly: MonthTotals[] = useMemo(() => data ? totalsByMonth(data.reports) : [], [data])
    const chart = useMemo(() => {
        const last = monthly.slice(-CHART_MONTHS)
        return { labels: last.map(m => shortMonth(m.month)), values: last.map(m => Math.round(m.net * 100) / 100) }
    }, [monthly])

    const thisMonth = currentMonthReport()
    const thisMonthReport = data ? data.list.find(r => r.month_report === thisMonth) : undefined
    const latest = monthly[monthly.length - 1]
    const previous = monthly[monthly.length - 2]
    const activeEmployees = data ? data.employees.filter(e => !isResigned(e)).length : 0
    const previousLabel = previous ? formatMonthReport(previous.month) : ''

    const recentRows = data ? data.reports.slice(0, RECENT_REPORTS).map(report => {
        const rows = (report.attributes || []).filter((row: any) => !isNamelessRow(row))
        return {
            report_id: report.report_id,
            month_report: report.month_report,
            people: rows.length,
            net: rows.reduce((total: number, row: any) => total + calcSalaryTotals(row).net, 0),
        }
    }) : []
    // People in this month's report, counted the same way as the recent reports table.
    const thisMonthFull = thisMonthReport && data ? data.reports.find(r => r.report_id === thisMonthReport.report_id) : undefined
    const thisMonthPeople = thisMonthFull ? (thisMonthFull.attributes || []).filter((row: any) => !isNamelessRow(row)).length : null
    const thisMonthPath = thisMonthReport ? '/ReportInfo/' + thisMonthReport.report_id : null
    const createReport = () => history.push('/salary-list', { create: true })

    const header = <HeaderComponent title='ภาพรวม' subTitle={latest ? `ข้อมูลล่าสุด ${formatMonthReport(latest.month)}` : null} />
    if (error) return <>{header}<div className='page-body'><div className='page-container'><LoadError error={error} onRetry={reload} /></div></div></>
    if (loading && !data) return <>{header}<div className='page-body'><div className='page-container'><Skeleton active paragraph={{ rows: 12 }} /></div></div></>

    return <>
        {header}
        <div className='page-body'>
            <div className='page-container'>
                <div className='dash-top'>
                    <section className='dash-hero'>
                        <span className='eyebrow'>เงินเดือนประจำเดือน</span>
                        <h2 className='dash-hero-title'>{formatMonthReport(thisMonth)}</h2>
                        <p className='dash-hero-text'>
                            {thisMonthReport
                                ? `สร้างรายงานแล้ว${thisMonthPeople !== null ? ` · ${thisMonthPeople} คน` : ''}`
                                : 'ยังไม่ได้สร้างรายงาน — เริ่มจากนำเข้าไฟล์ Excel'}
                        </p>
                        <div className='dash-hero-actions'>
                            {thisMonthPath
                                ? <Button type='primary' size='large' icon={<FileTextOutlined />} onClick={() => history.push(thisMonthPath)}>เปิดรายงาน</Button>
                                : <Button type='primary' size='large' icon={<PlusOutlined />} onClick={createReport}>สร้างรายงาน</Button>}
                            <Button size='large' onClick={() => history.push('/salary-list')}>ดูรายงานทั้งหมด</Button>
                        </div>
                    </section>
                    <MonthWorkflow reportPath={thisMonthPath} onCreate={createReport} />
                </div>

                {!latest ? <Card><Empty description='ยังไม่มีรายงานเงินเดือน' /></Card> : <>
                    <Row gutter={[16, 16]} className='kpi-row'>
                        <Col xs={24} sm={12} xl={6}>
                            <div className='kpi-outcome'>
                                <span className='kpi-icon'><WalletOutlined /></span>
                                <span className='kpi-label'>ยอดจ่ายสุทธิ {formatMonthReport(latest.month)}</span>
                                <span className='kpi-value'>{formatMoney(latest.net)}<span className='kpi-unit'>บาท</span></span>
                                <Delta change={percentChange(latest.net, previous?.net)} previousLabel={previousLabel} />
                            </div>
                        </Col>
                        <Col xs={24} sm={12} xl={6}>
                            <KpiCard icon={<FileTextOutlined />} label='รวมเงินได้ (ก่อนหัก)' value={formatMoney(latest.gross)} unit='บาท'
                                sub={<Delta change={percentChange(latest.gross, previous?.gross)} previousLabel={previousLabel} />} />
                        </Col>
                        <Col xs={24} sm={12} xl={6}>
                            <KpiCard icon={<SafetyCertificateOutlined />} label='ประกันสังคมที่ต้องนำส่ง (ส่วนพนักงาน)' value={formatMoney(latest.socialSecurity)} unit='บาท'
                                sub={<span className='kpi-sub'>ภาษีหัก ณ ที่จ่าย {formatMoney(latest.withholdingTax)} บาท</span>} />
                        </Col>
                        <Col xs={24} sm={12} xl={6}>
                            <KpiCard icon={<TeamOutlined />} label='จำนวนคนที่จ่าย' value={latest.headcount} unit='คน'
                                sub={<span className='kpi-sub'>พนักงานที่ทำงานอยู่ในระบบ {activeEmployees} คน</span>} />
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} xl={16}>
                            <Card title={`ยอดจ่ายสุทธิรายเดือน (${chart.labels.length} เดือนล่าสุด)`}>
                                <MonthlyBarChart labels={chart.labels} values={chart.values} valueLabel='ยอดจ่ายสุทธิ' />
                            </Card>
                        </Col>
                        <Col xs={24} xl={8}>
                            <Card title='รายงานล่าสุด' extra={<Link to='/salary-list'>ดูทั้งหมด</Link>} className='card-flush'>
                                <Table
                                    rowKey='report_id'
                                    size='small'
                                    pagination={false}
                                    dataSource={recentRows}
                                    columns={[
                                        { title: 'เดือน', dataIndex: 'month_report', render: (m: string, r: any) => <Link className='table-link' to={'/ReportInfo/' + r.report_id}>{formatMonthReport(m)}</Link> },
                                        { title: 'คน', dataIndex: 'people', align: 'right' as const },
                                        { title: 'ยอดสุทธิ', dataIndex: 'net', align: 'right' as const, render: (v: number) => formatMoney(v) },
                                    ]}
                                />
                            </Card>
                        </Col>
                    </Row>
                </>}
            </div>
        </div>
    </>
}
