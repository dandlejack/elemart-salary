import { useState, useEffect } from 'react'
import { Button, DatePicker, Input, notification } from 'antd'
import { EmployeeApi } from '../../api/EmployeeApi'
import { EditableTable } from '../EditTable/EditableTable'
import { AddSalaryColumn, salaryMonthColumn } from '../../mockData/mockColumnTable'
import { ReportApi } from '../../api/ReportApi'
import { IDataProps } from '../../types/StoreTypes'
import moment from 'moment'

export const AddSalaryForm: React.FC = () => {
    const [dataTable, setdataTable] = useState([] as Array<IDataProps>)
    const [monthPicker, setMonthPicker] = useState('' as string)
    const [getKeyDown, setKeyDown] = useState(false)
    const [userData, setUserData] = useState([] as Array<IDataProps>)
    const [alertInputMonth, setAlertInputMonth] = useState(false);
    useEffect(() => {
        const pushkeydown = (event: any) => {
            if (event.code === "Enter" || event.code === "NumpadEnter") {
                console.log("Enter key was pressed. Run your function.");
                setKeyDown(true)
                event.preventDefault();
            }
        };
        const pushkeyup = (event: any) => {
            setKeyDown(false)
        }
        document.addEventListener("keydown", pushkeydown);
        document.addEventListener("keyup", pushkeyup);
        EmployeeApi.findAllEmployees().then(res => {
            const storeObj: Array<IDataProps> = []
            res.map((data, index) => {
                storeObj.push(
                    {
                        fullname: data.fullname,
                        absent: 0,
                        agent: 0,
                        agent_tax: 0,
                        allowance: 0,
                        bonus: 0,
                        bonus_tax: 0,
                        fuel: 0,
                        late: 0,
                        key: index + 1,
                        lending: 0,
                        no: index + 1,
                        overtime: 0,
                        salary: data.current_salary,
                        social_security: data.social_security,
                        tax: 0,
                        operation: null
                    }
                )
            })
            setUserData(storeObj)
        })
        return () => {
            document.removeEventListener("keydown", pushkeydown);
            document.removeEventListener("keyup", pushkeyup);
        };
    }, []);

    const onSave = async () => {
        const result = dataTable.map((d: IDataProps) => {
            delete d.operation
            return d
        })
        const salaryDataForm = {
            year_of_report: monthPicker.split('/')[1],
            month_report: monthPicker,
            attributes: result
        }
        if (monthPicker !== "") {
            await ReportApi.addReport(salaryDataForm)
        } else {
            notificationOpen()
            setAlertInputMonth(true)
        }
    }
    
    const notificationOpen = () => {
        setAlertInputMonth(!alertInputMonth)
        notification['error']({
            message:'เกิดข้อผิดพลาด',
            description:'กรุณาเลือกเดือน-ปีของรายงาน',
            style: {
                width: 600,
              },
            duration:3
        })
    }

    const getTableData = (data: Array<IDataProps>) => {
        // 
        EmployeeApi.findAllEmployees().then(res => {
            const storeRes = res
            data.map(d => {
                const result = storeRes.find(ds => ds.fullname === d.fullname)
                if (result !== undefined) d.employees_id = result.employee_id

            })
            setdataTable(data)
        })
    }


    return <div>
        <div style={{ marginBottom: 15 }}>
            <span>เดือนที่</span> <DatePicker format={'MM/YYYY'} picker="month" onChange={(date: any, dateString: string) => setMonthPicker(dateString)} />

        </div>
        <div>
            <EditableTable column={AddSalaryColumn} getData={getTableData} oldData={userData} ablePagination={{ disabled: false }} showData={15} startCount={1} formType={'salary-month'}  />
        </div>
        <div style={{ margin: '15px auto', textAlign: 'center' }}>
            <Button type='primary' onClick={onSave}>เพิ่มรายงานเงินเดือน</Button>
        </div>
    </div>
}