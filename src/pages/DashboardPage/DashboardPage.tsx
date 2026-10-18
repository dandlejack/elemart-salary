import React, { useEffect, useMemo } from 'react'
import { Alert, Button, Card, Col, Empty, Row, Skeleton, Statistic, Table, Typography } from 'antd'
import { ArrowDownOutlined, ArrowUpOutlined, PlusOutlined } from '@ant-design/icons'
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

const Delta: React.FC<{ change: number | null, previousLabel: string }> = ({ change, previousLabel }) => {
    if (change === null) return <Typography.Text type='secondary'>ไม่มีเดือนก่อนหน้าให้เทียบ</Typography.Text>
    const up = change >= 0
    return <Typography.Text type='secondary'>
        {up ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(change).toFixed(1)}% จาก {previousLabel}
    </Typography.Text>
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

    const header = <HeaderComponent title='ภาพรวม' subTitle={latest ? `ข้อมูลล่าสุด ${formatMonthReport(latest.month)}` : null} />
    if (error) return <>{header}<div className='page-body'><LoadError error={error} onRetry={reload} /></div></>
    if (loading && !data) return <>{header}<div className='page-body'><Skeleton active paragraph={{ rows: 12 }} /></div></>

    return <>
        {header}
        <div className='page-body'>
            {thisMonthReport
                ? <Alert type='success' showIcon style={{ marginBottom: 16 }}
                    message={<>สร้างรายงานเงินเดือน {formatMonthReport(thisMonth)} แล้ว — <Link to={'/ReportInfo/' + thisMonthReport.report_id}>เปิดรายงาน</Link></>} />
                : <Alert type='info' showIcon style={{ marginBottom: 16 }}
                    message={`ยังไม่ได้สร้างรายงานเงินเดือน ${formatMonthReport(thisMonth)}`}
                    action={<Button type='primary' size='small' icon={<PlusOutlined />} onClick={() => history.push('/salary-list', { create: true })}>สร้างรายงาน</Button>} />}

            {!latest ? <Empty description='ยังไม่มีรายงานเงินเดือน' /> : <>
                <Row gutter={[16, 16]} className='kpi-row' style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} xl={6}>
                        <Card>
                            <Statistic title={`ยอดจ่ายสุทธิ ${formatMonthReport(latest.month)}`} value={formatMoney(latest.net)} suffix='บาท' />
                            <Delta change={percentChange(latest.net, previous?.net)} previousLabel={previousLabel} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} xl={6}>
                        <Card>
                            <Statistic title='รวมเงินได้ (ก่อนหัก)' value={formatMoney(latest.gross)} suffix='บาท' />
                            <Delta change={percentChange(latest.gross, previous?.gross)} previousLabel={previousLabel} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} xl={6}>
                        <Card>
                            <Statistic title='ประกันสังคม / ภาษีหัก ณ ที่จ่าย' value={formatMoney(latest.socialSecurity)} suffix={`/ ${formatMoney(latest.withholdingTax)}`} />
                            <Typography.Text type='secondary'>ยอดที่ต้องนำส่งของเดือนนี้ (ส่วนของพนักงาน)</Typography.Text>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} xl={6}>
                        <Card>
                            <Statistic title='จำนวนคนที่จ่าย' value={latest.headcount} suffix='คน' />
                            <Typography.Text type='secondary'>พนักงานที่ทำงานอยู่ในระบบ {activeEmployees} คน</Typography.Text>
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
                    <Col xs={24} xl={16}>
                        <Card title={`ยอดจ่ายสุทธิรายเดือน (${chart.labels.length} เดือนล่าสุด)`}>
                            <MonthlyBarChart labels={chart.labels} values={chart.values} valueLabel='ยอดจ่ายสุทธิ' />
                        </Card>
                    </Col>
                    <Col xs={24} xl={8}>
                        <Card title='รายงานล่าสุด' extra={<Link to='/salary-list'>ดูทั้งหมด</Link>} bodyStyle={{ padding: 0 }}>
                            <Table
                                rowKey='report_id'
                                size='small'
                                pagination={false}
                                dataSource={recentRows}
                                columns={[
                                    { title: 'เดือน', dataIndex: 'month_report', render: (m: string, r: any) => <Link to={'/ReportInfo/' + r.report_id}>{formatMonthReport(m)}</Link> },
                                    { title: 'คน', dataIndex: 'people', align: 'right' as const },
                                    { title: 'ยอดสุทธิ', dataIndex: 'net', align: 'right' as const, render: (v: number) => formatMoney(v) },
                                ]}
                            />
                        </Card>
                    </Col>
                </Row>
            </>}
        </div>
    </>
}
