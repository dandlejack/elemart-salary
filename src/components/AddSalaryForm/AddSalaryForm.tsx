import React, { useState, useEffect } from 'react'
import { Alert, Button, DatePicker, message, Space, Steps, Typography, Upload } from 'antd'
import { DownloadOutlined, InboxOutlined } from '@ant-design/icons'
import moment from 'moment'
import * as Excel from 'exceljs'
import { saveAs } from 'file-saver'
import { salarySummary } from '../SalarySummary/SalarySummary'
import { EmployeeApi, IEmployeeListItem, isResigned } from '../../api/EmployeeApi'
import { EditableTable } from '../EditTable/EditableTable'
import { AddSalaryColumn } from '../../mockData/mockColumnTable'
import { ReportApi } from '../../api/ReportApi'
import { IDataProps } from '../../types/StoreTypes'
import { ExcelRenderer } from 'react-excel-renderer';
import { calcFund, calcSocialSecurity, isNumeric, normalizeName } from '../../utils/Salary'
import { currentMonthReport, formatMonthReport } from '../../utils/Month'

// Column index of each field in the payroll Excel sheet (data starts at row 4).
// Columns 0-2 are: running number, first name (with title), last name.
const EXCEL_COLUMNS: Array<[keyof IDataProps, number, string]> = [
    ['salary', 3, 'เงินเดือน'],
    ['overtime', 4, 'โอที'],
    ['allowance', 5, 'เบี้ยเลี้ยง'],
    ['fuel', 6, 'ค่าน้ำมัน'],
    ['agent', 7, 'นายหน้า'],
    ['bonus', 8, 'โบนัส'],
    ['social_security', 9, 'ประกันสังคม'],
    ['tax', 10, 'ภาษีเงินได้'],
    ['agent_tax', 11, 'ภาษีนายหน้า'],
    ['lending', 12, 'เงินกู้,เงินยืม'],
    ['late', 13, 'มาสาย'],
    ['absent', 14, 'ขาดงาน'],
    ['bonus_tax', 15, 'ภาษีโบนัส'],
]
const EXCEL_FIRST_DATA_ROW = 3
const FIELD_TITLES: { [field: string]: string } = Object.fromEntries(EXCEL_COLUMNS.map(([field, , title]) => [field, title]))
// A total/summary line at the bottom of the sheet is not an employee.
const isTotalRow = (name: string) => /^(รวม|ยอดรวม|total)/i.test(name)

interface IImportSummary {
    fileName: string
    imported: number
    skippedBlank: number
    skippedTotal: number
    textCells: string[]
}

interface Props {
    // month_report of reports that already exist, to warn about duplicates.
    existingMonths: string[]
    onDone: () => void
    // Tells the parent whether closing would discard imported data.
    onDirtyChange?: (dirty: boolean) => void
}

// Sheet in the layout the importer reads, pre-filled with active employees and their current salary.
const downloadTemplate = async (employees: IEmployeeListItem[], monthReport: string) => {
    const workbook = new Excel.Workbook()
    const ws = workbook.addWorksheet('เงินเดือน')
    ws.addRow([`รายงานเงินเดือน ${formatMonthReport(monthReport)}`])
    ws.addRow(['กรอกข้อมูลตั้งแต่แถวที่ 4 ลงไป — ห้ามย้ายคอลัมน์ ชื่อ-สกุลต้องสะกดตรงกับในระบบ ช่องที่ไม่มีให้ใส่ 0'])
    ws.addRow(['ลำดับ', 'ชื่อ', 'สกุล', ...EXCEL_COLUMNS.map(([, , title]) => title)])
    const year = Number(monthReport.split('/')[1]) || new Date().getFullYear()
    employees.filter(e => !isResigned(e)).forEach((e, index) => {
        const name = normalizeName(e.fullname)
        const space = name.indexOf(' ')
        const values: any[] = [index + 1, space > 0 ? name.slice(0, space) : name, space > 0 ? name.slice(space + 1) : '']
        EXCEL_COLUMNS.forEach(([field, column]) => {
            values[column] = field === 'salary' ? e.current_salary || 0 : field === 'social_security' ? calcSocialSecurity(e.current_salary, year) : 0
        })
        ws.addRow(values)
    })
    ws.getRow(3).font = { bold: true }
    ws.columns.forEach((col, index) => { col.width = index === 1 || index === 2 ? 20 : 12 })
    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buffer]), `แบบฟอร์มเงินเดือน ${monthReport.replace('/', '-')}.xlsx`)
}

export const AddSalaryForm: React.FC<Props> = ({ existingMonths, onDone, onDirtyChange }) => {
    const [dataTable, setdataTable] = useState([] as Array<IDataProps>)
    // Payroll is usually prepared for the current month.
    const [monthPicker, setMonthPicker] = useState(currentMonthReport())
    const [employees, setEmployees] = useState([] as IEmployeeListItem[])
    const [importSummary, setImportSummary] = useState(null as IImportSummary | null)
    const [saving, setSaving] = useState(false)
    useEffect(() => {
        EmployeeApi.findAllEmployees().then(setEmployees).catch(() => message.error('โหลดรายชื่อพนักงานไม่สำเร็จ — การจับคู่ชื่ออาจไม่ถูกต้อง'))
    }, []);
    useEffect(() => {
        if (onDirtyChange) onDirtyChange(dataTable.length > 0)
    }, [dataTable.length, onDirtyChange]);
    const monthExists = monthPicker !== '' && existingMonths.includes(monthPicker)

    const onSave = async () => {
        if (monthPicker === "") {
            message.error('กรุณาเลือกเดือนของรายงาน')
            return
        }
        if (dataTable.length === 0) {
            message.error('ยังไม่มีข้อมูลเงินเดือน กรุณานำเข้าไฟล์ Excel')
            return
        }
        const result = dataTable.map((d: any) => {
            const { operation, _textCells, ...row } = d
            return row
        })
        setSaving(true)
        try {
            const saved = await ReportApi.addReport({
                year_of_report: monthPicker.split('/')[1],
                month_report: monthPicker,
                attributes: result
            })
            if (saved) {
                message.success(`บันทึกรายงานเงินเดือน ${formatMonthReport(monthPicker)} แล้ว`)
                onDone()
            } else message.error('บันทึกรายงานไม่สำเร็จ')
        } catch (err) {
            message.error('บันทึกรายงานไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ backend')
        }
        setSaving(false)
    }

    // The fund depends on the payroll month, so recalculate it for imported rows when the month changes.
    const changeMonth = (month: string) => {
        setMonthPicker(month)
        setdataTable(rows => rows.map(row => ({ ...row, fund: calcFund(row.salary, month) })))
    }

    const fileHandler = (fileObj: File) => {
        ExcelRenderer(fileObj, (err, resp) => {
            if (err) {
                console.log(err);
                message.error('อ่านไฟล์ Excel ไม่สำเร็จ กรุณาตรวจสอบว่าเป็นไฟล์ .xlsx หรือ .xls')
                return
            }
            const storeObj: Array<IDataProps> = []
            const textCells: string[] = []
            let skippedBlank = 0
            let skippedTotal = 0
            resp.rows.forEach((data, index) => {
                if (index < EXCEL_FIRST_DATA_ROW) return
                // Skip blank rows (rows without a name) and the sheet's total line.
                if (!data || normalizeName(data[1]) === '') {
                    skippedBlank++
                    return
                }
                if (isTotalRow(normalizeName(String(data[1])))) {
                    skippedTotal++
                    return
                }
                const fullname = data[2] !== undefined ? normalizeName(data[1] + ' ' + data[2]) : normalizeName(data[1]) + ' -'
                const employee = employees.find(ds => normalizeName(ds.fullname) === fullname)
                const row: IDataProps = {
                    fullname,
                    absent: 0,
                    agent: 0,
                    agent_tax: 0,
                    allowance: 0,
                    bonus: 0,
                    bonus_tax: 0,
                    fuel: 0,
                    late: 0,
                    lending: 0,
                    overtime: 0,
                    salary: 0,
                    social_security: 0,
                    tax: 0,
                    key: storeObj.length + 1,
                    no: data[0],
                    employees_id: employee?.employee_id,
                    note: '',
                    operation: null
                }
                const notes: string[] = []
                const rowTextCells: string[] = []
                EXCEL_COLUMNS.forEach(([field, column]) => {
                    const value = data[column]
                    if (isNumeric(value)) {
                        (row as any)[field] = Math.round(Number(value) * 100) / 100
                    } else {
                        (row as any)[field] = 0
                        // Free text in a number column (e.g. a resignation note) is kept as a note instead.
                        if (typeof value === 'string' && value.trim() !== '') {
                            notes.push(value.trim())
                            rowTextCells.push(field)
                            textCells.push(`${fullname} – ${FIELD_TITLES[field]}: "${value.trim()}"`)
                        }
                    }
                })
                row.note = notes.join(', ')
                row.fund = calcFund(row.salary, monthPicker)
                if (rowTextCells.length > 0) row._textCells = rowTextCells
                storeObj.push(row)
            })
            setdataTable(storeObj)
            setImportSummary({
                fileName: fileObj.name,
                imported: storeObj.length,
                skippedBlank,
                skippedTotal,
                textCells,
            })
        });
        // Read locally; nothing is uploaded.
        return false
    }

    const importSummaryAlerts = () => {
        if (!importSummary) return null
        const { fileName, imported, skippedBlank, skippedTotal, textCells } = importSummary
        // Live, so names fixed in the table drop off the list.
        const unmatched = dataTable.filter(row => !row.employees_id).map(row => row.fullname)
        const names = dataTable.map(row => normalizeName(row.fullname))
        const duplicates = Array.from(new Set(names.filter((name, index) => names.indexOf(name) !== index)))
        const skipped = [skippedBlank > 0 ? `ข้ามแถวว่าง ${skippedBlank} แถว` : '', skippedTotal > 0 ? `ข้ามแถวยอดรวม ${skippedTotal} แถว` : ''].filter(Boolean).join(', ')
        return <Space direction='vertical' className='full-width mb-16'>
            <Alert
                type={unmatched.length > 0 ? 'warning' : 'success'}
                showIcon
                message={`นำเข้า ${fileName}: ${imported} คน` + (skipped ? ` (${skipped})` : '')}
                description={unmatched.length > 0 ? <>
                    <div>จับคู่กับรายชื่อพนักงานไม่ได้ {unmatched.length} คน (แถวสีส้ม) — สลิปของคนเหล่านี้จะไม่ขึ้นในหน้าพนักงาน กรุณาตรวจสอบการสะกดชื่อ หรือคลิกที่ชื่อในตารางเพื่อเลือกพนักงานที่ถูกต้อง:</div>
                    <div>{unmatched.join(', ')}</div>
                </> : 'จับคู่กับรายชื่อพนักงานได้ครบทุกคน'}
            />
            {duplicates.length > 0 ? <Alert
                type='warning'
                showIcon
                message={`มีชื่อซ้ำในรายงาน ${duplicates.length} คน: ${duplicates.join(', ')}`}
                description='พนักงานคนเดียวควรมีแถวเดียว — ตรวจสอบแล้วลบแถวที่ซ้ำด้วยปุ่มถังขยะท้ายแถว'
            /> : null}
            {textCells.length > 0 ? <Alert
                type='warning'
                showIcon
                message={`มี ${textCells.length} ช่องที่เป็นข้อความแทนตัวเลข — ระบบตั้งเป็น 0 และเก็บข้อความไว้ในหมายเหตุ (ตัวเลขสีส้ม ⚠ ในตาราง)`}
                description={<ul style={{ margin: 0, paddingLeft: 18 }}>{textCells.map(text => <li key={text}>{text}</li>)}</ul>}
            /> : null}
        </Space>
    }

    const step = dataTable.length === 0 ? 1 : 2

    return <div>
        <Steps size='small' current={step} className='mb-24'>
            <Steps.Step title='เลือกเดือน' />
            <Steps.Step title='นำเข้าไฟล์ Excel' />
            <Steps.Step title='ตรวจสอบและบันทึก' />
        </Steps>
        <Space className='mb-16' align='center' wrap>
            <span>เดือนของรายงาน</span>
            <DatePicker format={'MM/YYYY'} picker="month" allowClear={false} value={monthPicker ? moment(monthPicker, 'MM/YYYY') : null} onChange={(date: any, dateString: string) => changeMonth(dateString)} />
            <Typography.Text type='secondary'>{formatMonthReport(monthPicker)}</Typography.Text>
        </Space>
        {monthExists ? <Alert className='mb-16' type='warning' showIcon message={`มีรายงานเงินเดือน ${formatMonthReport(monthPicker)} อยู่แล้ว — ถ้าบันทึกจะได้รายงานซ้ำ ถ้าต้องการแก้ไขให้เปิดรายงานเดิมจากหน้ารายงานเงินเดือน`} /> : null}
        <Upload.Dragger accept='.xlsx,.xls' showUploadList={false} beforeUpload={fileHandler}>
            <p className='ant-upload-drag-icon'><InboxOutlined /></p>
            <p className='ant-upload-text'>{importSummary ? `ไฟล์ปัจจุบัน: ${importSummary.fileName} — คลิกหรือลากไฟล์ใหม่มาวางเพื่อเปลี่ยน` : 'คลิกหรือลากไฟล์ Excel เงินเดือนมาวางที่นี่'}</p>
            <p className='ant-upload-hint'>ข้อมูลเริ่มที่แถวที่ 4: ลำดับ, ชื่อ, สกุล, {EXCEL_COLUMNS.map(([, , title]) => title).join(', ')}</p>
        </Upload.Dragger>
        <div className='upload-template mb-16'>
            <Button type='link' icon={<DownloadOutlined />} style={{ paddingLeft: 0 }} onClick={() => downloadTemplate(employees, monthPicker)}>
                ดาวน์โหลดแบบฟอร์ม Excel (ใส่ชื่อและเงินเดือนพนักงานที่ทำงานอยู่ให้แล้ว)
            </Button>
        </div>
        {importSummaryAlerts()}
        {dataTable.length > 0 ? <EditableTable column={AddSalaryColumn} getData={setdataTable} oldData={dataTable} showData={0} sticky={false} tableName='salary-table' summary={salarySummary(AddSalaryColumn)} rowClassName={(record: IDataProps) => record.employees_id ? '' : 'row-warning'} /> : null}
        <div className='form-actions'>
            <Button type='primary' size='large' onClick={onSave} loading={saving} disabled={dataTable.length === 0}>
                บันทึกรายงานเงินเดือน{dataTable.length > 0 ? ` (${dataTable.length} คน)` : ''}
            </Button>
        </div>
    </div>
}
