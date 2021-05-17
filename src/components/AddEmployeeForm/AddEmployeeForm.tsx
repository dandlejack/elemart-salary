import { useState, useEffect } from 'react'
import { Button, Input, InputNumber } from 'antd'
import { EmployeeApi } from '../../api/EmployeeApi'
export const AddEmployeeForm: React.FC = () => {
    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')
    const [salary, setSalary] = useState(0)
    const [showHaveAccount, setShowHaveAccount] = useState(false)
    const onSave = async () => {
        const employeeForm: any = {
            firstname: firstname,
            lastname: lastname,
            current_salary: salary,
            social_security : salary >= 15000 ? 750 : salary * 0.05,
            total_social_security: 0
        }
        await EmployeeApi.addEmployee(employeeForm)
    }
    return <div>
        <div>
            <Input placeholder='ชื่อ' onChange={e => setFirstname(e.target.value)} style={{ width: 720, marginLeft: 15 }} />
        </div>
        <div style={{ marginTop: 15 }}>
            <Input placeholder='สกุล' onChange={e => setLastname(e.target.value)} style={{ width: 720, marginLeft: 15 }} />
        </div>
        <div style={{ marginTop: 15 }}>
            <InputNumber placeholder='เงินเดือน' onChange={(value: number) => setSalary(value)} style={{ width: 720, marginLeft: 15 }} />
        </div>
        <div style={{ margin: '15px auto', textAlign: 'center' }}>
            <Button type='primary' onClick={onSave}>เพิ่มพนักงาน</Button>
        </div>
        {showHaveAccount ? <span style={{ color: 'red' }}>มีชื่อลูกค้ารายนี้แล้ว</span> : null}
    </div>
}