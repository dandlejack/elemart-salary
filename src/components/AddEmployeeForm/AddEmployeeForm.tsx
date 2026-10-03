import { useState } from 'react'
import { Button, Input, InputNumber, notification } from 'antd'
import { EmployeeApi } from '../../api/EmployeeApi'
import { calcSocialSecurity, normalizeName } from '../../utils/Salary'
export const AddEmployeeForm: React.FC = () => {
    const [employeeData, setEmployeeData] = useState({
        firstname:'',
        lastname:'',
        current_salary:0,
        social_security : 0
    })
    const onSave = async () => {
        const firstname = normalizeName(employeeData.firstname)
        const lastname = normalizeName(employeeData.lastname)
        if (firstname === '' || lastname === '' || !(employeeData.current_salary > 0)) {
            notification.error({ message: 'กรุณากรอกชื่อ สกุล และเงินเดือนให้ครบ', duration: 3 })
            return
        }
        await EmployeeApi.addEmployee({ ...employeeData, firstname, lastname })
    }
    return <div>
        <div>
            <Input placeholder='ชื่อ' onChange={e => setEmployeeData({...employeeData,firstname:e.target.value})} style={{ width: 720, marginLeft: 15 }} />
        </div>
        <div style={{ marginTop: 15 }}>
            <Input placeholder='สกุล' onChange={e => setEmployeeData({...employeeData,lastname:e.target.value})} style={{ width: 720, marginLeft: 15 }} />
        </div>
        <div style={{ marginTop: 15 }}>
            <InputNumber placeholder='เงินเดือน' min={0} onChange={(value: number) => setEmployeeData({...employeeData,current_salary:value, social_security:calcSocialSecurity(value)})} style={{ width: 720, marginLeft: 15 }} />
        </div>
        <div style={{ margin: '15px auto', textAlign: 'center' }}>
            <Button type='primary' onClick={onSave}>เพิ่มพนักงาน</Button>
        </div>
    </div>
}
