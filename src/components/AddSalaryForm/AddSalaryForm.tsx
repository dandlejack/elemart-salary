import React, { useState, useEffect } from 'react'
import { Button, DatePicker, Input, notification } from 'antd'
import { EmployeeApi } from '../../api/EmployeeApi'
import { EditableTable } from '../EditTable/EditableTable'
import { AddSalaryColumn, salaryMonthColumn } from '../../mockData/mockColumnTable'
import { ReportApi } from '../../api/ReportApi'
import { IDataProps } from '../../types/StoreTypes'
import { OutTable, ExcelRenderer } from 'react-excel-renderer';
import { CustomResult } from '../CustomResult/CustomResult'
export const AddSalaryForm: React.FC = () => {
    const [dataTable, setdataTable] = useState([] as Array<IDataProps>)
    const [monthPicker, setMonthPicker] = useState('' as string)
    const [getKeyDown, setKeyDown] = useState(false)
    const [userData, setUserData] = useState([] as Array<IDataProps>)
    const [alertInputMonth, setAlertInputMonth] = useState(false);
    const [visiblity, setVisiblity] = useState(false)
    const [excelData, setExcelData] = useState({
        cols: [],
        rows: []
    })
    useEffect(() => {
        const pushkeydown = (event: any) => {
            if (event.code === "Enter" || event.code === "NumpadEnter") {
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
            await ReportApi.addReport(salaryDataForm).then(res => {
                setVisiblity(true)
            })
        } else {
            notificationOpen()
            setAlertInputMonth(true)
        }
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

    const getTableData = (data: Array<IDataProps>) => {
        setdataTable(data)
        // 
        // EmployeeApi.findAllEmployees().then(res => {
        //     const storeRes = res
        //     data.map(d => {
        //         const result = storeRes.find(ds => ds.fullname === d.fullname)
        //         if (result !== undefined) d.employees_id = result.employee_id

        //     })
        //     setdataTable(data)
        // })
    }
    const fileHandler = (event) => {
        let fileObj = event.target.files[0];
        ExcelRenderer(fileObj, (err, resp) => {
            if (err) {
                console.log(err);
            }
            else {

                const storeObj: Array<IDataProps> = []
                resp.rows.map((data, index) => {
                    if (index >= 3) {
                        const d= userData.find(ds => ds.fullname === data[1] + ' ' + data[2])
                        storeObj.push(
                            {
                                fullname: data[2]!==undefined ? data[1] + ' ' + data[2] : data[1] + ' -',
                                absent: data[14] ? data[14] : 0,
                                agent: data[7] ? data[7] : 0,
                                agent_tax: data[11] ? parseInt(data[11]) : 0,
                                allowance: data[5] ? data[5] : 0,
                                bonus: data[8] ? data[8] : 0,
                                bonus_tax: data[15] ? data[15] : 0,
                                fuel: data[6] ? data[6] : 0,
                                late: data[13] ? data[13] : 0,
                                key: index + 1,
                                lending: data[12] ? data[12] : 0,
                                no: data[0],
                                overtime: data[4] ? data[4] : 0,
                                salary: data[3],
                                social_security: data[9] ? data[9] : 0,
                                tax: data[10] ? data[10] : 0,
                                employees_id:d?.employees_id,
                                operation: null
                            }
                        )
                }
                })
                setdataTable(storeObj)
            }
        });
    }

    return <div>
        <div style={{ marginBottom: 15 }}>
            <span>เดือนที่</span> <DatePicker format={'MM/YYYY'} picker="month" onChange={(date: any, dateString: string) => setMonthPicker(dateString)} />

        </div>
        <input type="file" onChange={e => fileHandler(e)} style={{ "padding": "10px" }} />
        <div>
            {/* <OutTable data={excelData.rows} columns={excelData.cols} tableClassName="ExcelTable2007" tableHeaderRowClass="heading" /> */}
            <EditableTable column={AddSalaryColumn} getData={getTableData} oldData={dataTable} ablePagination={{ disabled: false }} showData={15} startCount={1} formType={'salary-month'} tableName='salary-table' />
        </div>
        <div style={{ margin: '15px auto', textAlign: 'center' }}>
            <Button type='primary' onClick={onSave}>เพิ่มรายงานเงินเดือน</Button>
        </div>
        {visiblity ? <CustomResult title='เพิ่มข้อมูลเรียบร้อย' countTime={5} visibility={visiblity} /> : null}
    </div>
}