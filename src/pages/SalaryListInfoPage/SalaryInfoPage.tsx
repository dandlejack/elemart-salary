import { Button, Popconfirm, Switch, Table } from 'antd'
import React, { useEffect, useState } from 'react'
import { ReportApi } from '../../api/ReportApi'
import { HeaderComponent } from '../../components/HeaderComponent'
import { AddSalaryColumn } from '../../mockData/mockColumnTable'
import { IReportProps } from '../../types/StoreTypes'
import { generateExcel } from '../../components/Excel/ExcelComponent'
import { EditableCell } from '../../components/EditTable/EditableCell'
import { EditableTable } from '../../components/EditTable/EditableTable'
import { CustomResult } from '../../components/CustomResult/CustomResult'
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
    const [count, setCount] = useState(0);
    const [visiblity, setVisiblity] = useState(false)
    const [canEdit, setCanEdit] = useState(false)
    useEffect(() => {
        ReportApi.findAllReports({
            filterObject: {
                report_id: id
            }
        }).then(res => {
            const filterThaiMonth = monthVal.filter(d => d.key === res[0].month_report.split('/')[0])[0].value
            setMonthReport(filterThaiMonth + ' ' + res[0].month_report.split('/')[1])
            setDataSource(res[0].attributes)
            setCount(res[0].attributes.length)
        })
        ReportApi.findTest({
            filterObject: {
                month_report: '03/2021',
                type:'lending'
            }
        }).then(res => {
            console.log(res)
        })
        return () => {
        };
    }, [id]);

    // const handleDelete = (key: number) => {
    //     const filterData = dataSource.filter((item: any) => item.key !== key)
    //     setDataSource(filterData);
    //     setCount(count - 1)
    // };

    // const handleOperation = (data: any) => {
    //     data.operation = (
    //         <Popconfirm
    //             title="Sure to delete?"
    //             onConfirm={() => handleDelete(data.key)}
    //         >
    //             <a style={{ color: 'red' }}>Delete</a>
    //         </Popconfirm>
    //     );
    //     return data.operation
    // };

    // useEffect(() => {
    //     dataSource.map((data: any, index: number) => {
    //         data.key = index + 1
    //         handleOperation(data);
    //         return data;
    //     });
    // }, [dataSource])
    const getTableData = (data: any) => {        // 

        setDataSource(data)
    }
    const updateData = () => {
        const data = {
            attributes:dataSource
        }
        ReportApi.updateReportByReportID(id,data).then(res=>{
            setVisiblity(!visiblity)
        })
    }
    
    return <>
        <HeaderComponent title={monthReport} nameOfLinkPath='' />
        <div style={{ width: 250,marginTop:15 }}>
            <Switch checkedChildren='ยกเลิกการแก้ไข' unCheckedChildren='แก้ไข' onChange={e => setCanEdit(!canEdit)} /> 
        </div>
        <div style={{ marginTop: 15, marginRight: 15, textAlign: 'right' }}>
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
        {!canEdit ?
                <Table className='t' columns={AddSalaryColumn} dataSource={dataSource} />
            :
            <EditableTable column={AddSalaryColumn} getData={getTableData} oldData={dataSource} ablePagination={{ disabled: false }} showData={10} startCount={1} formType={'salary-month'} />
        }
        {/* <Table className='t' columns={AddSalaryColumn} dataSource={dataSource} /> */}

        {canEdit?<Button style={{width:150,marginLeft:10}} onClick={updateData} type='primary'>Update</Button>:null}
        {visiblity?<CustomResult title='อัพเดทข้อมูลเรียบร้อย' countTime={5} visibility={visiblity} />:null}

    </>
}