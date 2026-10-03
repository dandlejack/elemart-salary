import React, { useState, useEffect } from 'react'
import { Button, DatePicker, notification } from 'antd'
import { EmployeeApi } from '../../api/EmployeeApi'
import { EditableTable } from '../EditTable/EditableTable'
import { AddSalaryColumn } from '../../mockData/mockColumnTable'
import { ReportApi } from '../../api/ReportApi'
import { IDataProps } from '../../types/StoreTypes'
import { ExcelRenderer } from 'react-excel-renderer';
import { CustomResult } from '../CustomResult/CustomResult'
import { calcFund, isNumeric, normalizeName } from '../../utils/Salary'

// Column index of each field in the payroll Excel sheet (data starts at row 4).
const EXCEL_COLUMNS: Array<[keyof IDataProps, number]> = [
    ['salary', 3],
    ['overtime', 4],
    ['allowance', 5],
    ['fuel', 6],
    ['agent', 7],
    ['bonus', 8],
    ['social_security', 9],
    ['tax', 10],
    ['agent_tax', 11],
    ['lending', 12],
    ['late', 13],
    ['absent', 14],
    ['bonus_tax', 15],
]
const EXCEL_FIRST_DATA_ROW = 3

export const AddSalaryForm: React.FC = () => {
    const [dataTable, setdataTable] = useState([] as Array<IDataProps>)
    const [monthPicker, setMonthPicker] = useState('' as string)
    const [userData, setUserData] = useState([] as Array<{ employees_id: string, fullname: string }>)
    const [visiblity, setVisiblity] = useState(false)
    useEffect(() => {
        EmployeeApi.findAllEmployees().then(res => {
            setUserData((res || []).map(data => ({ employees_id: data.employee_id, fullname: data.fullname })))
        })
    }, []);

    const onSave = async () => {
        if (monthPicker === "") {
            notificationOpen('กรุณาเลือกเดือน-ปีของรายงาน')
            return
        }
        if (dataTable.length === 0) {
            notificationOpen('ยังไม่มีข้อมูลเงินเดือน กรุณานำเข้าไฟล์ Excel')
            return
        }
        const result = dataTable.map((d: IDataProps) => {
            const { operation, ...row } = d
            return row
        })
        const salaryDataForm = {
            year_of_report: monthPicker.split('/')[1],
            month_report: monthPicker,
            attributes: result
        }
        try {
            const saved = await ReportApi.addReport(salaryDataForm)
            if (saved) setVisiblity(true)
            else notificationOpen('บันทึกรายงานไม่สำเร็จ')
        } catch (err) {
            notificationOpen('บันทึกรายงานไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ backend')
        }
    }

    const notificationOpen = (description: string) => {
        notification['error']({
            message: 'เกิดข้อผิดพลาด',
            description,
            style: {
                width: 600,
            },
            duration: 3
        })
    }

    const getTableData = (data: Array<IDataProps>) => {
        setdataTable(data)
    }

    // The fund depends on the payroll month, so recalculate it for imported rows when the month changes.
    const changeMonth = (month: string) => {
        setMonthPicker(month)
        setdataTable(rows => rows.map(row => ({ ...row, fund: calcFund(row.salary, month) })))
    }

    const fileHandler = (event) => {
        let fileObj = event.target.files[0];
        if (!fileObj) return
        ExcelRenderer(fileObj, (err, resp) => {
            if (err) {
                console.log(err);
                notificationOpen('อ่านไฟล์ Excel ไม่สำเร็จ')
                return
            }
            const storeObj: Array<IDataProps> = []
            resp.rows.forEach((data, index) => {
                // Skip header rows and blank rows (rows without a name).
                if (index < EXCEL_FIRST_DATA_ROW || !data || normalizeName(data[1]) === '') return
                const fullname = data[2] !== undefined ? normalizeName(data[1] + ' ' + data[2]) : normalizeName(data[1]) + ' -'
                const employee = userData.find(ds => normalizeName(ds.fullname) === fullname)
                const row: IDataProps = {
                    fullname,
                    absent: 0,
                    agent: 0,
                    agent_tax: 0,
                    allowance: 0,
                    bonus: 0,
                    bonus_tax: 0,
                    fuel: 0,
                    late: 0,
                    lending: 0,
                    overtime: 0,
                    salary: 0,
                    social_security: 0,
                    tax: 0,
                    key: storeObj.length + 1,
                    no: data[0],
                    employees_id: employee?.employees_id,
                    note: '',
                    operation: null
                }
                const notes: string[] = []
                EXCEL_COLUMNS.forEach(([field, column]) => {
                    const value = data[column]
                    if (isNumeric(value)) {
                        (row as any)[field] = Math.round(Number(value) * 100) / 100
                    } else {
                        (row as any)[field] = 0
                        // Free text in a number column (e.g. a resignation note) is kept as a note instead.
                        if (typeof value === 'string' && value.trim() !== '') notes.push(value.trim())
                    }
                })
                row.note = notes.join(', ')
                row.fund = calcFund(row.salary, monthPicker)
                storeObj.push(row)
            })
            setdataTable(storeObj)
        });
    }

    return <div>
        <div style={{ marginBottom: 15 }}>
            <span>เดือนที่</span> <DatePicker format={'MM/YYYY'} picker="month" onChange={(date: any, dateString: string) => changeMonth(dateString)} />

        </div>
        <input type="file" onChange={e => fileHandler(e)} style={{ "padding": "10px" }} />
        <div>
            <EditableTable column={AddSalaryColumn} getData={getTableData} oldData={dataTable} ablePagination={{ disabled: false }} showData={15} startCount={1} formType={'salary-month'} tableName='salary-table' />
        </div>
        <div style={{ margin: '15px auto', textAlign: 'center' }}>
            <Button type='primary' onClick={onSave}>เพิ่มรายงานเงินเดือน</Button>
        </div>
        {visiblity ? <CustomResult title='เพิ่มข้อมูลเรียบร้อย' countTime={5} visibility={visiblity} /> : null}
    </div>
}
