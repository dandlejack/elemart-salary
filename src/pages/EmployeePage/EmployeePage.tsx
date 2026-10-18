import { Button, Input, message, Modal, Radio, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import { EmployeeApi, IEmployeeListItem, isResigned } from '../../api/EmployeeApi'
import { AddEmployeeForm } from '../../components/AddEmployeeForm/AddEmployeeForm'
import { HeaderComponent } from '../../components/HeaderComponent'
import { LoadError } from '../../components/LoadError/LoadError'
import { confirmDelete, employeeColumns } from '../../mockData/mockColumnTable'
import { normalizeName } from '../../utils/Salary'
import { stickyHeader } from '../../utils/TableLayout'
import { useRequest } from '../../utils/useRequest'

type StatusFilter = 'active' | 'resigned' | 'all'

export const EmployeePage: React.FC = () => {
    const { data, loading, error, reload } = useRequest(() => EmployeeApi.findAllEmployees())
    const employees = data || []
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('active' as StatusFilter)
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        document.title = 'รายชื่อพนักงาน'
    }, []);

    const changeStatus = (employee: IEmployeeListItem, status: 'active' | 'resigned') => {
        const run = async () => {
            try {
                await EmployeeApi.setEmployeeStatus(employee.employee_id, status)
                message.success(status === 'resigned' ? `ตั้ง ${employee.fullname} เป็นลาออกแล้ว` : `${employee.fullname} กลับมาทำงานแล้ว`)
                reload()
            } catch (e) {
                message.error('บันทึกไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ')
            }
        }
        if (status === 'active') return run()
        Modal.confirm({
            title: <>ตั้ง <b>{employee.fullname}</b> เป็นลาออก?</>,
            content: 'ยังเปิดสลิปเงินเดือนย้อนหลังได้ตามปกติ แต่จะไม่แสดงในรายชื่อพนักงานที่ทำงานอยู่',
            okText: 'ตั้งเป็นลาออก',
            cancelText: 'ยกเลิก',
            onOk: run,
        })
    }

    const deleteEmployee = (employee: IEmployeeListItem) => confirmDelete(
        <>ลบพนักงาน <b>{employee.fullname}</b>?</>,
        'ถ้าพนักงานลาออก ให้ใช้ "ตั้งเป็นลาออก" แทน — การลบจะทำให้เปิดสลิปเงินเดือนย้อนหลังของคนนี้จากหน้านี้ไม่ได้อีก (รายงานเงินเดือนยังอยู่)',
        async () => {
            try {
                await EmployeeApi.deleteEmployeeByEmployeeId(employee.employee_id)
                message.success(`ลบ ${employee.fullname} แล้ว`)
                reload()
            } catch (e) {
                message.error('ลบไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ')
            }
        })

    const counts = {
        active: employees.filter(e => !isResigned(e)).length,
        resigned: employees.filter(isResigned).length,
        all: employees.length,
    }
    const query = normalizeName(search)
    const shown = employees
        .filter(e => statusFilter === 'all' || (statusFilter === 'resigned') === isResigned(e))
        .filter(e => query === '' || normalizeName(e.fullname || '').includes(query))

    return <>
        <HeaderComponent title='พนักงาน' extra={<Button type='primary' icon={<PlusOutlined />} onClick={() => setAdding(true)}>เพิ่มพนักงาน</Button>} />
        <div className='page-body'>
            {error ? <LoadError error={error} onRetry={reload} /> : null}
            {error && !data ? null : <>
                <div className='page-toolbar'>
                    <Input.Search allowClear placeholder='ค้นหาชื่อพนักงาน' style={{ width: 280 }} onChange={e => setSearch(e.target.value)} />
                    <Radio.Group value={statusFilter} onChange={e => setStatusFilter(e.target.value)} optionType='button'>
                        <Radio.Button value='active'>ทำงานอยู่ ({counts.active})</Radio.Button>
                        <Radio.Button value='resigned'>ลาออก ({counts.resigned})</Radio.Button>
                        <Radio.Button value='all'>ทั้งหมด ({counts.all})</Radio.Button>
                    </Radio.Group>
                </div>
                <Table
                    rowKey='employee_id'
                    columns={employeeColumns({ onStatusChange: changeStatus, onDelete: deleteEmployee })}
                    dataSource={shown}
                    loading={loading}
                    size='middle'
                    scroll={{ x: 640 }}
                    sticky={stickyHeader}
                    pagination={shown.length > 50 ? { pageSize: 50 } : false}
                    locale={{ emptyText: query ? 'ไม่พบพนักงานที่ค้นหา' : 'ยังไม่มีพนักงาน' }}
                />
            </>}
        </div>
        <Modal title='เพิ่มพนักงาน' visible={adding} footer={null} onCancel={() => setAdding(false)} destroyOnClose width={520}>
            <AddEmployeeForm existingNames={employees.map(e => e.fullname)} onDone={() => { setAdding(false); reload() }} />
        </Modal>
    </>
}
