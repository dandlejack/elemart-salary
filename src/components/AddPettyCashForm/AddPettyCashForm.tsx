import React, { useState } from 'react'
import { Button, DatePicker, Input, notification } from 'antd'
import { EditableTable } from '../EditTable/EditableTable'
import { AddPettyCashColumn } from '../../mockData/mockColumnTable'
import { PettyCashAttributesProps, PettyCashDataProps } from '../../types/StoreTypes'
import { PettyCashApi } from '../../api/PettyCashApi'
import { CustomResult } from '../CustomResult/CustomResult'

export const AddPettyCashForm: React.FC = () => {
    const [dataTable, setdataTable] = useState({
        attributes: [],
        month_report: '',
        year_of_report: ''
    } as PettyCashDataProps)
    const [visiblity, setVisiblity] = useState(false)
    const [alertInputMonth, setAlertInputMonth] = useState(false);

    const onSave = async () => {
        if (dataTable.attributes.length > 0 && dataTable.month_report !== '') {
            await PettyCashApi.insertPettyCashReport(dataTable).then(res => {
                setVisiblity(true)
            })
        } else {
            setAlertInputMonth(!alertInputMonth)
        }
    }

    const notificationOpen = () => {
        notification['error']({
            message: 'เกิดข้อผิดพลาด',
            description: 'กรุณาเลือกเดือน-ปีของรายงาน',
            style: {
                width: 600,
            },
            duration: 3
        })
        setAlertInputMonth(!alertInputMonth)
    }

    const getTableData = (data: Array<PettyCashAttributesProps>) => {
        setdataTable({ ...dataTable, attributes: data })
    }


    return <div>
        <div style={{ marginBottom: 15 }}>
            <span>เดือนที่</span> <DatePicker format={'MM/YYYY'} picker="month" onChange={(date: any, dateString: string) => setdataTable({ ...dataTable, month_report: dateString, year_of_report: dateString.split('/')[1] })} />

        </div>
        <div>
            <EditableTable column={AddPettyCashColumn} getData={getTableData} oldData={dataTable.attributes} ablePagination={{ disabled: false }} showData={15} startCount={1} formType={'salary-month'} tableName='petty-cash' />
        </div>
        <div style={{ margin: '15px auto', textAlign: 'center' }}>
            <Button type='primary' onClick={onSave}>เพิ่มรายงานเงินเดือน</Button>
        </div>
        {visiblity ? <CustomResult title='เพิ่มข้อมูลเรียบร้อย' countTime={5} visibility={visiblity} /> : null}
        {alertInputMonth?notificationOpen():null}
    </div>
}