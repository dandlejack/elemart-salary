import { Table } from 'antd'
import React, { useEffect, useState } from 'react'
import { createImportSpecifier } from 'typescript'
import { ReportApi } from '../../api/ReportApi'
import { HeaderComponent } from '../../components/HeaderComponent'
import { AddSalaryColumn } from '../../mockData/mockColumnTable'
import { IReportProps } from '../../types/StoreTypes'



export const SalaryInfoPage: React.FC<{ match: any }> = ({ match }) => {
    const { id } = match.params
    const [dataSource, setDataSource] = useState([] as Array<IReportProps>);
    useEffect(() => {
        ReportApi.findAllReports({
            filterObject: {
                report_id: id
            }
        }).then(res => {
            console.log(res)
            setDataSource(res[0].attributes)
        })

        return () => {
        };
    }, [id]);
    return <>
        <HeaderComponent title='Employee Info' nameOfLinkPath='' />
        <Table className='t' columns={AddSalaryColumn} dataSource={dataSource} bordered />
    </>
}