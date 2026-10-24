import { useState } from 'react'
import { Alert, Button, Form, Input, InputNumber, message, Select } from 'antd'
import { EmployeeApi } from '../../api/EmployeeApi'
import { calcSocialSecurity, formatMoney, normalizeName } from '../../utils/Salary'

// Stored as part of the first name, the same way the payroll Excel writes it ("นายธานี", "นส.อุบลวรรณ", "MR. ANURAG").
const PREFIXES = [
    { label: 'นาย', value: 'นาย' },
    { label: 'นาง', value: 'นาง' },
    { label: 'นส.', value: 'นส.' },
    { label: 'MR.', value: 'MR. ' },
    { label: 'MRS.', value: 'MRS. ' },
    { label: 'MS.', value: 'MS. ' },
    { label: 'ไม่ระบุ', value: '' },
]

interface Props {
    // Names already in the system, to warn about duplicates.
    existingNames: string[]
    onDone: () => void
}

export const AddEmployeeForm: React.FC<Props> = ({ existingNames, onDone }) => {
    const [form] = Form.useForm()
    const [values, setValues] = useState({ prefix: 'นาย', firstname: '', lastname: '', current_salary: null as number | null })
    const [saving, setSaving] = useState(false)
    const firstname = normalizeName(values.prefix + values.firstname)
    const lastname = normalizeName(values.lastname)
    const fullname = normalizeName(firstname + ' ' + lastname)
    const duplicate = values.firstname !== '' && existingNames.some(name => normalizeName(name) === fullname)

    const onSave = async () => {
        try {
            await form.validateFields()
        } catch (e) {
            return
        }
        setSaving(true)
        try {
            const salary = values.current_salary || 0
            await EmployeeApi.addEmployee({ firstname, lastname, current_salary: salary, social_security: calcSocialSecurity(salary) })
            message.success(`เพิ่ม ${fullname} แล้ว`)
            form.resetFields()
            onDone()
        } catch (e) {
            message.error('เพิ่มพนักงานไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ')
        }
        setSaving(false)
    }

    return <Form form={form} layout='vertical' initialValues={values} onValuesChange={(_, all) => setValues({ ...values, ...all })} onFinish={onSave}>
        <Form.Item label='ชื่อ' required style={{ marginBottom: 0 }}>
            <Input.Group compact style={{ display: 'flex', alignItems: 'flex-start' }}>
                <Form.Item name='prefix' noStyle>
                    <Select options={PREFIXES} style={{ width: 110 }} />
                </Form.Item>
                <Form.Item name='firstname' rules={[{ required: true, whitespace: true, message: 'กรุณากรอกชื่อ' }]} style={{ flex: 1 }}>
                    <Input autoFocus placeholder='เช่น ธานี' />
                </Form.Item>
            </Input.Group>
        </Form.Item>
        <Form.Item label='สกุล' name='lastname' rules={[{ required: true, whitespace: true, message: 'กรุณากรอกสกุล' }]}>
            <Input placeholder='เช่น แซ่เอี๊ย' />
        </Form.Item>
        <Form.Item label='เงินเดือน (บาท)' name='current_salary' rules={[{ required: true, type: 'number', min: 1, message: 'กรุณากรอกเงินเดือน' }]}
            extra={values.current_salary ? `ประกันสังคมที่ระบบคำนวณ: ${formatMoney(calcSocialSecurity(values.current_salary))} บาท` : null}>
            <InputNumber min={0} className='full-width' placeholder='เช่น 18,800'
                formatter={(v: any) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(v: any) => (v || '').replace(/,/g, '')} />
        </Form.Item>
        {values.firstname || values.lastname ? <Alert
            className='mb-16'
            type={duplicate ? 'warning' : 'info'}
            showIcon
            message={<>ชื่อในระบบ: <b>{fullname}</b></>}
            description={duplicate ? 'มีพนักงานชื่อนี้อยู่แล้ว' : 'ต้องสะกดตรงกับชื่อในไฟล์ Excel เงินเดือน ระบบจึงจะจับคู่สลิปให้ได้'}
        /> : null}
        <div className='form-actions form-actions-flush'>
            <Button type='primary' htmlType='submit' loading={saving}>เพิ่มพนักงาน</Button>
        </div>
    </Form>
}
