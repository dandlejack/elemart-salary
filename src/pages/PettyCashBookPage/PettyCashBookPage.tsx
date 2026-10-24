import { Button, message, Modal, Table } from "antd"
import { PlusOutlined } from "@ant-design/icons"
import React, { useEffect, useState } from "react"
import { PettyCashApi } from "../../api/PettyCashApi"
import { AddPettyCashForm } from "../../components/AddPettyCashForm/AddPettyCashForm"
import { HeaderComponent } from "../../components/HeaderComponent"
import { LoadError } from "../../components/LoadError/LoadError"
import { confirmDelete, pettyCashListColumns } from "../../mockData/mockColumnTable"
import { formatMonthReport, sortNewestFirst } from "../../utils/Month"
import { useRequest } from "../../utils/useRequest"
import { confirmDiscard } from "../../utils/confirmDiscard"
import { useUnsavedChangesWarning } from "../../utils/useUnsavedChangesWarning"

export const PettyCashBookPage: React.FC = () => {
    const { data, loading, error, reload } = useRequest(async () => sortNewestFirst(await PettyCashApi.findList()))
    const months = data || []
    const [creating, setCreating] = useState(false)
    const [formDirty, setFormDirty] = useState(false)
    useUnsavedChangesWarning(creating && formDirty)
    useEffect(() => {
        document.title = 'สมุดเงินสดย่อย'
    }, []);

    const deleteMonth = (record: any) => confirmDelete(
        <>ลบสมุดเงินสดย่อย <b>{formatMonthReport(record.month_report)}</b>?</>,
        'รายการทั้งหมดของเดือนนี้จะถูกลบ และกู้คืนไม่ได้',
        async () => {
            try {
                await PettyCashApi.deleteReportByPettyCashId(record.pettycash_id)
                message.success(`ลบ ${formatMonthReport(record.month_report)} แล้ว`)
                reload()
            } catch (e) {
                message.error('ลบไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ')
            }
        })

    return <>
        <HeaderComponent title='สมุดเงินสดย่อย' extra={<Button type='primary' icon={<PlusOutlined />} onClick={() => setCreating(true)}>สร้างเดือนใหม่</Button>} />
        <div className='page-body'>
            {error ? <LoadError error={error} onRetry={reload} /> : null}
            {error && !data ? null : <>
                <Table
                    rowKey='pettycash_id'
                    columns={pettyCashListColumns(deleteMonth)}
                    dataSource={months}
                    loading={loading}
                    size='middle'
                    pagination={{ pageSize: 12, showSizeChanger: false, showTotal: total => `ทั้งหมด ${total} เดือน` }}
                    locale={{ emptyText: 'ยังไม่มีสมุดเงินสดย่อย' }}
                    scroll={{ x: 900 }}
                />
            </>}
        </div>
        <Modal title='สร้างสมุดเงินสดย่อย' visible={creating} footer={null} onCancel={() => confirmDiscard(formDirty, () => setCreating(false))} destroyOnClose width='95%' style={{ maxWidth: 1300, top: 24 }}>
            <AddPettyCashForm existing={months} onDirtyChange={setFormDirty} onDone={() => { setFormDirty(false); setCreating(false); reload() }} />
        </Modal>
    </>
}
