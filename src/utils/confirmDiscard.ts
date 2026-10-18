import { Modal } from 'antd'

export const DISCARD_MESSAGE = 'มีข้อมูลที่ยังไม่ได้บันทึก ต้องการทิ้งการแก้ไขหรือไม่?'

// Runs `discard` right away when nothing would be lost, otherwise asks first.
export const confirmDiscard = (dirty: boolean, discard: () => void) => {
    if (!dirty) return discard()
    Modal.confirm({
        title: 'ทิ้งข้อมูลที่ยังไม่ได้บันทึก?',
        content: 'ข้อมูลที่แก้ไขหรือนำเข้าไว้จะหายไป',
        okText: 'ทิ้งการแก้ไข',
        okButtonProps: { danger: true },
        cancelText: 'กลับไปแก้ไขต่อ',
        onOk: discard,
    })
}
