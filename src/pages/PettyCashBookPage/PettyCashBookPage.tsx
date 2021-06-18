import { Table } from "antd"
import React, { useState,useEffect } from "react"
import { PettyCashApi } from "../../api/PettyCashApi"
import { AddPettyCashForm } from "../../components/AddPettyCashForm/AddPettyCashForm"
import { HeaderComponent } from "../../components/HeaderComponent"
import { PettyCashList } from "../../mockData/mockColumnTable"

export const PettyCashBookPage: React.FC = () => {
    const [dataSource, setDataSource] = useState([] as Array<Object>)
    useEffect(() => {
        PettyCashApi.findList().then(res=>setDataSource(res))
    }, []);
    return <>
        <HeaderComponent title='สมุดเงินสดย่อย' nameOfLinkPath='สร้างรายงาน' linkPath='/add_salary' modalWidth={'90%'} component={<AddPettyCashForm />} />
        <Table columns={PettyCashList} bordered dataSource={dataSource} />
    </>
}