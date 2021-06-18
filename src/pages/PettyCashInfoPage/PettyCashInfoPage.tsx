import { Button, Result, Switch, Table } from 'antd'
import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import { PettyCashApi } from '../../api/PettyCashApi'
import { CustomModal } from '../../components/CustomModal/CustomModal'
import { CustomResult } from '../../components/CustomResult/CustomResult'
import { EditableTable } from '../../components/EditTable/EditableTable'
import { generateExcel } from '../../components/Excel/ExcelComponent'
import { HeaderComponent } from '../../components/HeaderComponent'
import { AddPettyCashColumn } from '../../mockData/mockColumnTable'
import { PettyCashDataProps } from '../../types/StoreTypes'
export const PettyCashInfoPage: React.FC<{ match: any }> = ({ match }) => {
    const { id } = match.params
    const history = useHistory()
    const [dataSource, setDataSource] = useState({
        attributes: [] as Array<PettyCashDataProps>,
        month_report: '',
        year_of_report: ''
    })
    const [editable, setEditable] = useState(false)
    const [visiblity, setVisiblity] = useState(false)
    useEffect(() => {
        const fetchData = async () => {
            const result = await PettyCashApi.findReportByPettyCashId(id).then(res => res)
            setDataSource(result)
        }
        fetchData()
        return () => {
        }
    }, [id])
    const getTableData = (data: any) => {
        setDataSource({ ...dataSource, attributes: data })
    }

    const updateData = async () => {
        let countToRefresh = 5
        await PettyCashApi.updateReporyByPettyCashId(id, dataSource.attributes).then(res => {
            setVisiblity(true)            
        })

    }
    

    return <div>
        <HeaderComponent nameOfLinkPath={''} title={dataSource.month_report} />
        <div style={{ marginTop: 15, marginRight: 15, textAlign: 'right' }}>
            <Button
                type='primary'
                style={{ backgroundColor: '#2ec500', borderRadius: '5px', marginBottom: 15 }}
                onClick={e =>
                    generateExcel(AddPettyCashColumn, `สมุดเงินสดย่อย เดือน ${dataSource.month_report.replace('/', ' ปี ')}`, dataSource.attributes)
                }
            >
                Generate Excel
                </Button>
        </div>
        <div style={{ marginLeft: 15 }} className='space-between-component'>
            <Switch checkedChildren='ยกเลิก' unCheckedChildren='แก้ไข' onChange={e => setEditable(!editable)} />
        </div>
        {!editable ? <Table columns={AddPettyCashColumn} dataSource={dataSource.attributes} bordered /> : <>
            <EditableTable column={AddPettyCashColumn} getData={getTableData} oldData={dataSource.attributes} ablePagination={{ disabled: false }} showData={10} startCount={1} formType={'petty-cash'} tableName={'petty-cash'} />
            <Button style={{ width: 150, marginLeft: 10 }} onClick={updateData} type='primary'>Update</Button>
        </>}
        {visiblity?<CustomResult title='อัพเดทข้อมูลเรียบร้อย' countTime={5} visibility={visiblity} />:null}

    </div>
}