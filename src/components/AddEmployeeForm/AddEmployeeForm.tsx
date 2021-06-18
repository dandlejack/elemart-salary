import { useState, useEffect } from 'react'
import { Button, Input, InputNumber } from 'antd'
import { EmployeeApi } from '../../api/EmployeeApi'
export const AddEmployeeForm: React.FC = () => {
    const [employeeData, setEmployeeData] = useState({
        firstname:'',
        lastname:'',
        salary:0,
        social_security : 0,
        total_social_security: 0
    })
    const onSave = async () => {
        await EmployeeApi.addEmployee(employeeData)
    }
    return <div>
        <div>
            <Input placeholder='ชื่อ' onChange={e => setEmployeeData({...employeeData,firstname:e.target.value})} style={{ width: 720, marginLeft: 15 }} />
        </div>
        <div style={{ marginTop: 15 }}>
            <Input placeholder='สกุล' onChange={e => setEmployeeData({...employeeData,lastname:e.target.value})} style={{ width: 720, marginLeft: 15 }} />
        </div>
        <div style={{ marginTop: 15 }}>
            <InputNumber placeholder='เงินเดือน' onChange={(value: number) => setEmployeeData({...employeeData,salary:value, social_security:value >= 15000 ? 750 : value * 0.05})} style={{ width: 720, marginLeft: 15 }} />
        </div>
        <div style={{ margin: '15px auto', textAlign: 'center' }}>
            <Button type='primary' onClick={onSave}>เพิ่มพนักงาน</Button>
        </div>
    </div>
}