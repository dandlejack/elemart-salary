import { Button, InputNumber, Select, Statistic, Switch } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { EmployeeApi } from "../../api/EmployeeApi";
import { ReportApi } from "../../api/ReportApi";
import { HeaderComponent } from "../../components/HeaderComponent";
import logo from '../../images/logo-com.png'
import { AddComma, AddCommaOfObject } from '../../utils/AddComma'
import { SelectValue } from "antd/lib/select";
import { IReportMonthList, IEmployeeProps, IReportProps, ITotalSocialAndLate } from "../../types/StoreTypes";
import { GeneratePDF } from "../../components/GeneratePDF/GeneratePDF";



export const EmployeeInfoPage: React.FC<{ match: any }> = ({ match }) => {
    const { id } = match.params;
    const ref = useRef<HTMLDivElement>(null)
    const [reportMonthList, setReportMonthList] = useState([] as Array<IReportMonthList>)
    const [dataSource, setDataSource] = useState({} as IEmployeeProps)
    const [reportSource, setReportSource] = useState({} as IReportProps)
    const [reportMonth, setReportMonth] = useState('' as SelectValue)
    const [reportThaiMonth, setReportThaiMonth] = useState('' as SelectValue)
    const [totalSocialandLate, setTotalSocialandLate] = useState({} as ITotalSocialAndLate);
    const [currentSalary, setCurrentSalary] = useState(0)
    const [editable, setEditable] = useState(false)
    const [summaryOfTotal, setSummaryOfTotal] = useState({
        gross_total: '0',
        deuction_total: '0',
        total: '0'
    })
    useEffect(() => {
        const getData = async () => {
            ReportApi.findSalaryList({
                filterObject: {
                    'attributes.employees_id': id
                }
            }).then(res => {
                setReportMonthList(res)
            })
            await EmployeeApi.findEmployeeByEmployeeId(id).then(data => {
                setDataSource(data)
                return data
            })
        }
        getData()
        return () => {
        };
    }, [id]);

    useEffect(() => {
        ReportApi.findAllReports({
            filterObject: {
                'attributes.fullname': dataSource.firstname + ' ' + dataSource.lastname,
                'month_report': reportMonth,
            },
            getAttributes: {
                _id: 0,
                'attributes.$': 1
            }
        }).then(res => {
            if (res.length > 0) {
                const commaTest: IReportProps = AddCommaOfObject(res[0].attributes[0])
                const data = res[0].attributes[0]
                const gross = data.salary + data.overtime + data.allowance + data.fuel + data.agent + data.bonus
                const deductions = data.social_security + data.tax + data.agent_tax + data.lending + data.late + data.absent + data.bonus_tax
                setSummaryOfTotal({
                    gross_total: AddComma(gross),
                    deuction_total: AddComma(deductions),
                    total: AddComma(gross - deductions)
                })
                setReportSource(commaTest)
            }
        })
        ReportApi.findSumLateAndSecuritySocial({
            filterObject: {
                'attributes.fullname': dataSource.firstname + ' ' + dataSource.lastname,
                year_of_report: reportMonth?.toString().split('/')[1]
            }
        }).then(res => {
            console.log(dataSource.firstname + ' ' + dataSource.lastname)
            const result = AddCommaOfObject(res)
            setTotalSocialandLate(result)
        })
        return () => {

        };
    }, [reportMonth]);

    const changeMonth = val => {
        const monthNum = val.split('/')[0]
        const thisYear = (parseInt(val.split('/')[1]) + 543).toString()
        const monthVal = [
            {
                key: '01',
                value: 'ม.ค.'
            },
            {
                key: '02',
                value: 'ก.พ.'
            },
            {
                key: '03',
                value: 'มี.ค.'
            },
            {
                key: '04',
                value: 'เม.ย.'
            },
            {
                key: '05',
                value: 'พ.ค.'
            },
            {
                key: '06',
                value: 'มิ.ย.'
            },
            {
                key: '07',
                value: 'ก.ค.'
            },
            {
                key: '08',
                value: 'ส.ค.'
            },
            {
                key: '09',
                value: 'ก.ย.'
            },
            {
                key: '10',
                value: 'ต.ค.'
            },
            {
                key: '11',
                value: 'พ.ย.'
            },
            {
                key: '12',
                value: 'ธ.ค.'
            },
        ]
        const filterThaiMonth = monthVal.filter(d => d.key === monthNum)[0].value
        setReportMonth(val)
        setReportThaiMonth(filterThaiMonth + ' ' + thisYear)
    }
    const updateSalary = () => {
        const data = {
            current_salary: currentSalary,
            social_security: currentSalary >= 15000 ? 750 : currentSalary * 0.05
        }
        EmployeeApi.updateEmployeeByEmployeeId(id, data)
    }

    return <div style={{ marginBottom: 50 }}>
        <HeaderComponent title='Employee Info' nameOfLinkPath='' />
        <div style={{ width: '100%', marginTop: 15, marginRight: 10, position: 'relative' }}>
            {reportMonth !== '' ? <GeneratePDF document={document.getElementById('page-pdf')} fullname={dataSource.firstname + ' ' + dataSource.lastname} reportMonth={reportThaiMonth} /> : <></>}
        </div>
        <div style={{ marginLeft: 15 }} className='space-between-component'>
            <Switch checkedChildren='ยกเลิก' unCheckedChildren='แก้ไข' onChange={e => setEditable(!editable)} />
        </div>
        <div style={{ marginLeft: 15 }} className='space-between-component'>
            <Statistic title="เงินเดือนปัจจุบัน" value={dataSource.current_salary +" บาท"} />
        </div>
        {editable ? <div style={{ marginLeft: 15 }} className='space-between-component'>
            <InputNumber style={{width:150}} onChange={(salary: number) => setCurrentSalary(salary)} /> <Button type='primary' onClick={updateSalary}>Update</Button>
        </div> : <></>}
        <div style={{ marginLeft: 15 }} className='space-between-component'>
            <Select onChange={val => changeMonth(val)} style={{ width: 150 }} >
                {reportMonthList.map(data => {
                    return <Select.Option value={data.month_report}>{data.month_report}</Select.Option>
                })}
            </Select>
        </div>
       

        <div style={{ width: 1280, margin: '50px auto', position: 'relative' }} id='page-pdf' ref={ref}>
            <div className='space-between-component'>
                <img className='company-logo' src={logo} />
                <div style={{ fontSize: 18, marginTop: 10, fontWeight: 'bolder' }}>
                    <h4>ELE-MART CO., LTD.</h4>
                    <span>62 63 Phraya Suren Rd, Bang Chan, Khlong Sam Wa, Bangkok 10510</span>
                </div>
            </div>
            <div className='space-between-component1' style={{ width: '100%' }}>
                <span className='A4-Font' style={{ marginRight: 15 }}>ชื่อ-สกุล</span>
                <span className='A4-Font' >{dataSource.firstname + ' ' + dataSource.lastname}</span>
                <span className='A4-Font' style={{ float: 'right' }}>{reportThaiMonth ? '25 ' + reportThaiMonth : ''}</span>
                <span className='A4-Font' style={{ marginRight: 15, float: 'right' }}>วันที่จ่าย </span>
            </div>
            <div className='space-between-component'>
            </div>
            <table className='description-table space-between-component'>
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
                    <td>{reportSource.salary}</td>
                    <td>ภาษีเงินได้</td>
                    <td>{reportSource.tax}</td>
                    <td>รวมเงินได้</td>
                    <td>{summaryOfTotal.gross_total}</td>
                </tr>
                <tr>
                    <td>โอที</td>
                    <td>{reportSource.overtime}</td>
                    <td>ประกันสังคม</td>
                    <td>{reportSource.social_security}</td>
                    <td>รวมเงินหัก</td>
                    <td>{summaryOfTotal.deuction_total}</td>
                </tr>
                <tr>
                    <td>เบี้ยเลี้ยง</td>
                    <td>{reportSource.allowance}</td>
                    <td>มาสาย</td>
                    <td>{reportSource.late}</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td>น้ำมัน</td>
                    <td>{reportSource.fuel}</td>
                    <td>ขาด</td>
                    <td>{reportSource.absent}</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td>นายหน้า</td>
                    <td>{reportSource.agent}</td>
                    <td>ภาษีนายหน้า</td>
                    <td>{reportSource.agent_tax}</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td>โบนัส</td>
                    <td>{reportSource.bonus}</td>
                    <td>ภาษีโบนัส</td>
                    <td>{reportSource.bonus_tax}</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td>เงินยืมบริษัท</td>
                    <td>{reportSource.lending}</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td >รวมรายได้</td>
                    <td >{summaryOfTotal.gross_total}</td>
                    <td>รวมรายการหัก</td>
                    <td >{summaryOfTotal.deuction_total}</td>
                    <td>เงินได้สุทธิ</td>
                    <td >{summaryOfTotal.total}</td>
                </tr>
            </table>
            <div>
                <span className='A4-Font' style={{ marginRight: 7, fontWeight: 'bolder' }}>*ประกันสังคมสะสม : {totalSocialandLate.total_security_social} </span>
                <span className='A4-Font' style={{ marginRight: 7, fontWeight: 'bolder' }}>*มาสายสะสม : {totalSocialandLate.total_late} </span>
                <span className='A4-Font' style={{ marginRight: 7, fontWeight: 'bolder' }}>*มาสายสะสม : {totalSocialandLate.total_late} </span>
                <span className='A4-Font' style={{ marginRight: 7, fontWeight: 'bolder' }}>*เงินยืมที่จ่าย : {totalSocialandLate.total_lending} </span>
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