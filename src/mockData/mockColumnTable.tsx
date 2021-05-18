import { Button, Popconfirm } from "antd"
import React from "react"
import { Link } from "react-router-dom"
import { EmployeeApi } from "../api/EmployeeApi"
import { ReportApi } from "../api/ReportApi"

export const employeeColumn = [
    {
        title: 'ชื่อ-สกุล',
        key: 'fullname',
        dataIndex: 'fullname',
        width: 200,
    },
    {
        title: 'เงินเดือน',
        key: 'current_salary',
        dataIndex: 'current_salary',
        dataType: 'number',
        width:150
    },
    {
        title: 'Operation',
        key: 'operation',
        dataIndex: 'operation',
        width: 200,
        render: (text: string, record: any) => (
            <>
                <Link to={{ pathname: '/EmployeeInfo/' + record.employee_id }}>
                    <Button
                        type='primary'
                        onClick={e => localStorage.setItem('prevLocation', 'reports')}
                        style={{ marginRight: 8 }}
                    >
                        ดูรายละเอียด
                </Button>
                </Link>
                <Popconfirm
                    title="คุณต้องการลบรายงานนี้?"
                    onConfirm={() => {
                        EmployeeApi.deleteEmployeeByEmployeeId(record.employee_id).then(res=>{
                            window.location.reload()
                        })
                    }}//(record._id)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type='primary' danger >Delete</Button>
                </Popconfirm>
            </>
        ),
    }
]

export const salaryMonthColumn = [
    {
        title: 'รายการ',
        key: 'month_report',
        dataIndex: 'month_report',
        width: 200,
    },
    {
        title: 'Operation',
        key: 'operation',
        dataIndex: 'operation',
        width: 200,
        render: (text: string, record: any) => (
            <>
                <Link to={{ pathname: '/ReportInfo/' + record.report_id }}>
                    <Button
                        type='primary'
                        style={{ marginRight: 8 }}
                    >
                        ดูรายละเอียด
                </Button>
                </Link>
                <Popconfirm
                    title="คุณต้องการลบรายงานนี้?"
                    onConfirm={() => {
                        ReportApi.deleteReportById(record.report_id).then(res => {
                            window.location.reload()
                        })
                    }}//(record._id)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type='primary' danger >Delete</Button>
                </Popconfirm>
            </>
        ),
    }
]

export const AddSalaryColumn = [
    {
        title: 'ลำดับ',
        key: 'key',
        dataIndex: 'key',
        width:70,
        fixed:'left' as any | undefined
    },
    {
        title: 'ชื่อ-สกุล',
        key: 'fullname',
        dataIndex: 'fullname',
        dataType: 'select',
        width:200,
        fixed:'left' as any | undefined,
        editable: true
    },
    {
        title: 'เงินเดือน',
        key: 'salary',
        dataIndex: 'salary',
        dataType: 'number',
    },
    {
        title: 'โอที',
        key: 'overtime',
        dataIndex: 'overtime',
        dataType: 'number',
        editable: true
    },
    {
        title: 'เบี้ยเลี้ยง',
        key: 'allowance',
        dataIndex: 'allowance',
        dataType: 'number',
        editable: true
    },
    {
        title: 'ค่าน้ำมัน',
        key: 'fuel',
        dataIndex: 'fuel',
        dataType: 'number',
        editable: true
    },
    {
        title: 'นายหน้า',
        key: 'agent',
        dataIndex: 'agent',
        dataType: 'number',
        editable: true
    },
    {
        title: 'ประกันสังคม',
        key: 'social_security',
        dataIndex: 'social_security',
        dataType: 'number',
        editable: true
    },
    {
        title: 'TAX',
        key: 'tax',
        dataIndex: 'tax',
        dataType: 'number',
        editable: true
    },
    {
        title: 'ภาษีนายหน้า',
        key: 'agent_tax',
        dataIndex: 'agent_tax',
        dataType: 'number',
        editable: true
    },
    {
        title: 'เงินยืม',
        key: 'lending',
        dataIndex: 'lending',
        dataType: 'number',
        editable: true
    },
    {
        title: 'LATE',
        key: 'late',
        dataIndex: 'late',
        dataType: 'number',
        editable: true
    },
    {
        title: 'ขาด',
        key: 'absent',
        dataIndex: 'absent',
        dataType: 'number',
        editable: true
    },
    {
        title: 'โบนัส',
        key: 'bonus',
        dataIndex: 'bonus',
        dataType: 'number',
        editable: true
    },
    {
        title: 'ภาษีโบนัส',
        key: 'bonus_tax',
        dataIndex: 'bonus_tax',
        dataType: 'number',
        editable: true
    },
    {
        title:'Action',
        key:'operation',
        dataIndex:'operation',
    }
]