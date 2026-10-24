import { Button, Card } from 'antd'
import { DisconnectOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { BACKEND_API } from '../../config'

// Shown instead of an empty table when a request fails, so "no data" is never confused with "no connection".
export const LoadError: React.FC<{ error: any, onRetry: () => void }> = ({ error, onRetry }) => {
    const noResponse = error && !error.response
    return <Card className='load-error' role='alert'>
        <span className='load-error-icon'>{noResponse ? <DisconnectOutlined /> : <ExclamationCircleOutlined />}</span>
        <div className='load-error-title'>{noResponse ? 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' : 'โหลดข้อมูลไม่สำเร็จ'}</div>
        <div className='load-error-text'>{noResponse
            ? <>ติดต่อ backend ที่ <code>{BACKEND_API}</code> ไม่ได้ — ตรวจสอบว่าเครื่อง server เปิดอยู่ หรือแก้ไข IP ในหน้าตั้งค่า</>
            : <>เซิร์ฟเวอร์ตอบกลับผิดพลาด ({error?.response?.status}) กรุณาลองใหม่อีกครั้ง</>}</div>
        <div className='load-error-actions'>
            <Button type='primary' onClick={onRetry}>ลองใหม่</Button>
            {noResponse ? <Link to='/setting'><Button>ไปหน้าตั้งค่า</Button></Link> : null}
        </div>
    </Card>
}
