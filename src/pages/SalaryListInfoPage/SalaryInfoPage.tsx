import { Button, Table } from 'antd'
import React, { useEffect, useState } from 'react'
import { ReportApi } from '../../api/ReportApi'
import { HeaderComponent } from '../../components/HeaderComponent'
import { AddSalaryColumn } from '../../mockData/mockColumnTable'
import { IReportProps } from '../../types/StoreTypes'
import { generateExcel } from '../../components/Excel/ExcelComponent'
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

export const SalaryInfoPage: React.FC<{ match: any }> = ({ match }) => {
    const { id } = match.params
    const [dataSource, setDataSource] = useState([] as Array<IReportProps>);
    const [monthReport, setMonthReport] = useState('');
    useEffect(() => {
        ReportApi.findAllReports({
            filterObject: {
                report_id: id
            }
        }).then(res => {
            console.log(res)
            const filterThaiMonth = monthVal.filter(d => d.key === res[0].month_report.split('/')[0])[0].value
            setMonthReport(filterThaiMonth + ' ' + res[0].month_report.split('/')[1])
            setDataSource(res[0].attributes)
        })

        return () => {
        };
    }, [id]);
    console.log(dataSource)
    return <>
        <HeaderComponent title={monthReport} nameOfLinkPath='' />
        <div style={{marginTop:15,marginRight:15,textAlign:'right'}}>
            <Button
                type='primary'
                style={{ backgroundColor: '#2ec500', borderRadius: '5px', marginBottom: 15 }}
                onClick={e =>
                    generateExcel(AddSalaryColumn, monthReport, dataSource)
                }
            >
                Generate Excel
                </Button>
        </div>
        <Table className='t' columns={AddSalaryColumn} dataSource={dataSource} bordered />
    </>
}