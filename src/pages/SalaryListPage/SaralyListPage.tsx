import { Table } from 'antd'
import React, { useEffect, useState } from 'react'
import { ReportApi } from '../../api/ReportApi'
import { AddSalaryForm } from '../../components/AddSalaryForm/AddSalaryForm'
import { HeaderComponent } from '../../components/HeaderComponent'
import { salaryMonthColumn } from '../../mockData/mockColumnTable'
export const SaralyListPage: React.FC = () => {
    const [dataSource, setDataSource] = useState([] as Array<Object>)
    useEffect(() => {
        ReportApi.findSalaryList({}).then(res=>{
            setDataSource(res)
        })
        return () => {
            
        };
    }, []);
    return <>
        <HeaderComponent title='Salary' nameOfLinkPath='สร้างรายงาน' linkPath='/add_salary' modalWidth={1300} component={<AddSalaryForm/>} />
        <Table columns={salaryMonthColumn} bordered dataSource={dataSource} />
    </>
}