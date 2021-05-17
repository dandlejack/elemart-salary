import { Table } from 'antd'
import React, { useEffect, useState } from 'react'
import { EmployeeApi } from '../../api/EmployeeApi'
import { AddEmployeeForm } from '../../components/AddEmployeeForm/AddEmployeeForm'
import { HeaderComponent } from '../../components/HeaderComponent'
import { employeeColumn } from '../../mockData/mockColumnTable'
export const EmployeePage: React.FC = () => {
    
    const [dataSource, setDataSource] = useState([])

    useEffect(() => {
        EmployeeApi.findAllEmployees().then(data=>{
            setDataSource(data)
        })
        return () => {
            
        };
    }, []);

    return <>
        <HeaderComponent title='Employee' nameOfLinkPath='เพิ่มพนักงาน' linkPath='/add_employee' component={<AddEmployeeForm/>} modalWidth={800} />
        <Table columns={employeeColumn} dataSource={dataSource} bordered pagination={{defaultPageSize:100}} />
    </>
}