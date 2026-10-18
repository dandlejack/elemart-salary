import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { BACKEND_API } from '../../config'
import { HeaderComponent } from '../../components/HeaderComponent'

type TestResult = { ok: boolean, text: string } | null

const backendUrl = (ip: string) => `http://${ip.trim()}:4000`

export const SettingPage: React.FC = () => {
    const [ip, setIp] = useState(localStorage.getItem('storeIP') || '')
    const [testing, setTesting] = useState(false)
    const [result, setResult] = useState(null as TestResult)

    useEffect(() => {
        document.title = 'ตั้งค่า'
    }, []);

    const test = async () => {
        if (ip.trim() === '') return
        setTesting(true)
        setResult(null)
        try {
            const res = await axios.get(`${backendUrl(ip)}/employees/findall`, { timeout: 5000 })
            setResult({ ok: true, text: `เชื่อมต่อได้ — พบพนักงาน ${(res.data || []).length} คน` })
        } catch (e) {
            setResult({ ok: false, text: `เชื่อมต่อ ${backendUrl(ip)} ไม่ได้ — ตรวจสอบ IP และว่าเครื่อง server เปิดอยู่` })
        }
        setTesting(false)
    }

    // The backend address is read when the app starts, so the page reloads to apply it.
    const save = () => {
        localStorage.setItem('storeIP', ip.trim())
        window.location.reload()
    }
    const reset = () => {
        localStorage.removeItem('storeIP')
        window.location.reload()
    }

    return <>
        <HeaderComponent title='ตั้งค่า' />
        <div className='page-body'>
            <Card title='การเชื่อมต่อเซิร์ฟเวอร์ (backend)' style={{ maxWidth: 640 }}>
                <Typography.Paragraph>
                    ใช้อยู่ตอนนี้: <code>{BACKEND_API}</code>
                </Typography.Paragraph>
                <Form layout='vertical' onFinish={test}>
                    <Form.Item label='IP ของเครื่อง server' extra='เช่น 192.168.1.20 — ระบบจะต่อที่พอร์ต 4000'>
                        <Input value={ip} placeholder='เช่น 192.168.1.20' onChange={e => { setIp(e.target.value); setResult(null) }} style={{ maxWidth: 260 }} />
                    </Form.Item>
                    {result ? <Alert style={{ marginBottom: 16 }} type={result.ok ? 'success' : 'error'} showIcon message={result.text} /> : null}
                    <Space>
                        <Button htmlType='submit' loading={testing} disabled={ip.trim() === ''}>ทดสอบการเชื่อมต่อ</Button>
                        <Button type='primary' onClick={save} disabled={ip.trim() === ''}>บันทึกและใช้งาน</Button>
                        {localStorage.getItem('storeIP') ? <Button type='link' onClick={reset}>กลับไปใช้ค่าเริ่มต้น</Button> : null}
                    </Space>
                </Form>
            </Card>
        </div>
    </>
}
