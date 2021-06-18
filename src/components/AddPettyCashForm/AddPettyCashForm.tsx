import { useState, useEffect } from 'react'
import { Button, DatePicker, Input, notification } from 'antd'
import { EmployeeApi } from '../../api/EmployeeApi'
import { EditableTable } from '../EditTable/EditableTable'
import { AddPettyCashColumn } from '../../mockData/mockColumnTable'
import { ReportApi } from '../../api/ReportApi'
import { IDataProps, PettyCashAttributesProps, PettyCashDataProps } from '../../types/StoreTypes'
import moment from 'moment'
import { PettyCashApi } from '../../api/PettyCashApi'

export const AddPettyCashForm: React.FC = () => {
    const [dataTable, setdataTable] = useState({
        attributes: [],
        month_report: '',
        year_of_report: ''
    } as PettyCashDataProps)
    const [alertInputMonth, setAlertInputMonth] = useState(false);

    const onSave = async () => {
        await PettyCashApi.insertPettyCashReport(dataTable)
    }

    const notificationOpen = () => {
        setAlertInputMonth(!alertInputMonth)
        notification['error']({
            message: 'เกิดข้อผิดพลาด',
            description: 'กรุณาเลือกเดือน-ปีของรายงาน',
            style: {
                width: 600,
            },
            duration: 3
        })
    }

    const getTableData = (data: Array<PettyCashAttributesProps>) => {
        setdataTable({...dataTable,attributes:data})
    }


    return <div>
        <div style={{ marginBottom: 15 }}>
            <span>เดือนที่</span> <DatePicker format={'MM/YYYY'} picker="month" onChange={(date: any, dateString: string) => setdataTable({...dataTable,month_report:dateString,year_of_report:dateString.split('/')[1]})} />

        </div>
        <div>
            <EditableTable column={AddPettyCashColumn} getData={getTableData} oldData={dataTable.attributes} ablePagination={{ disabled: false }} showData={15} startCount={1} formType={'salary-month'} tableName='petty-cash' />
        </div>
        <div style={{ margin: '15px auto', textAlign: 'center' }}>
            <Button type='primary' onClick={onSave}>เพิ่มรายงานเงินเดือน</Button>
        </div>
    </div>
}