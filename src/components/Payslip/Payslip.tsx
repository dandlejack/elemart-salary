import React, { useEffect, useRef, useState } from 'react'
import logo from '../../images/logo-com.png'
import { calcSalaryTotals, formatMoney, isNumeric } from '../../utils/Salary'
import { ITotalSocialAndLate } from '../../types/StoreTypes'

export interface PayslipProps {
    fullname: string
    // Salary row of this employee in the report.
    row: any
    // Year-to-date totals up to this report.
    totals: ITotalSocialAndLate
    // e.g. "25 ต.ค. 2564"
    payDate: string
}

export const PAYSLIP_WIDTH = 1280

// Deductions are shown negative; zero stays "0.00" instead of "-0.00".
const deduction = (value: any) => {
    if (isNumeric(value) && Number(value) === 0) return formatMoney(0)
    if (value === undefined || value === null || value === '') return formatMoney(0)
    return isNumeric(value) ? '-' + formatMoney(value) : String(value)
}
const negative = (amount: number) => amount === 0 ? formatMoney(0) : '-' + formatMoney(amount)

// The printed payslip (A4 layout, rendered at a fixed width and captured to PDF).
export const Payslip: React.FC<PayslipProps> = ({ fullname, row, totals, payDate }) => {
    const field = (key: string) => formatMoney(row[key])
    // Payslips before the fund started (no fund value stored) keep their original layout.
    const showFund = row.fund !== undefined && row.fund !== null
    const { gross, deductions, net } = calcSalaryTotals(row)

    return <div className='payslip' style={{ width: PAYSLIP_WIDTH, padding: '24px 0', background: '#fff' }}>
        <div className='space-between-component' style={{ marginBottom: '0.2cm' }}>
            <img className='company-logo' src={logo} alt='ELE-MART' />
            <div style={{ fontSize: 18, marginTop: 10, fontWeight: 'bolder' }} className='A4-Font'>
                <h4>ELE-MART CO., LTD.</h4>
                <span>62,63 Phraya Suren Rd, Bang Chan, Khlong Sam Wa, Bangkok 10510</span>
            </div>
        </div>
        <div className='space-between-component1' style={{ width: '100%', display: 'flex' }}>
            <span className='A4-Font' style={{ marginRight: 15 }}>ชื่อ-สกุล</span>
            <span className='A4-Font' style={{ flex: 1 }}>{fullname}</span>
            <span className='A4-Font' style={{ marginRight: 15 }}>วันที่จ่าย</span>
            <span className='A4-Font'>{payDate}</span>
        </div>
        <table className='description-table space-between-component A4-Font'>
            <tr >
                <th></th>
                <th></th>
            </tr>
            <tr style={{ borderTop: '3px solid #000' }}>
                <th style={{ fontSize: '1.7rem', fontWeight: 'bold' }} colSpan={2}>รายได้(Income)</th>
                <th style={{ fontSize: '1.7rem', fontWeight: 'bold' }} colSpan={2}>รายการหัก(Deduction)</th>
                <th style={{ fontWeight: 'bold' }} colSpan={2}></th>
            </tr>
            <tr>
                <td>เงินเดือน</td>
                <td>{field('salary')}</td>
                <td>ภาษีเงินได้</td>
                <td>{deduction(row.tax)}</td>
                <td>รวมเงินได้</td>
                <td>{formatMoney(gross)}</td>
            </tr>
            <tr>
                <td>โอที</td>
                <td>{field('overtime')}</td>
                <td>ประกันสังคม</td>
                <td>{deduction(row.social_security)}</td>
                <td>รวมเงินหัก</td>
                <td>{negative(deductions)}</td>
            </tr>
            <tr>
                <td>เบี้ยเลี้ยง</td>
                <td>{field('allowance')}</td>
                <td>มาสาย</td>
                <td>{deduction(row.late)}</td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td>น้ำมัน</td>
                <td>{field('fuel')}</td>
                <td>ขาด</td>
                <td>{deduction(row.absent)}</td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td>นายหน้า</td>
                <td>{field('agent')}</td>
                <td>ภาษีนายหน้า</td>
                <td>{deduction(row.agent_tax)}</td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td>โบนัส</td>
                <td>{field('bonus')}</td>
                <td>ภาษีโบนัส</td>
                <td>{deduction(row.bonus_tax)}</td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td></td>
                <td></td>
                <td>เงินกู้,เงินยืมบริษัท</td>
                <td>{deduction(row.lending)}</td>
                <td></td>
                <td></td>
            </tr>
            {showFund ? <tr>
                <td></td>
                <td></td>
                <td>กองทุน</td>
                <td>{deduction(row.fund)}</td>
                <td></td>
                <td></td>
            </tr> : null}
            <tr>
                <td >รวมรายได้</td>
                <td >{formatMoney(gross)}</td>
                <td>รวมรายการหัก</td>
                <td >{negative(deductions)}</td>
                <td>เงินได้สุทธิ</td>
                <td >{formatMoney(net)}</td>
            </tr>
        </table>
        <div>
            <span className='A4-Font' style={{ marginRight: 7, fontWeight: 'bolder' }}>*ประกันสังคมสะสม : {formatMoney(totals.total_security_social)} </span>
            <span className='A4-Font' style={{ marginRight: 7, fontWeight: 'bolder' }}>*มาสายสะสม : {formatMoney(totals.total_late)} </span>
            <span className='A4-Font' style={{ marginRight: 7, fontWeight: 'bolder' }}>*ขาดสะสม : {formatMoney(totals.total_absent)} </span>
            <span className='A4-Font' style={{ marginRight: 7, fontWeight: 'bolder' }}>*เงินยืมที่จ่าย : {formatMoney(totals.total_lending)} </span>
            {showFund ? <span className='A4-Font' style={{ marginRight: 7, fontWeight: 'bolder' }}>*กองทุนสะสม : {formatMoney(totals.total_fund)} </span> : null}
        </div>
    </div>
}

// Shows a fixed-width document shrunk to fit the available width (the PDF is rendered separately at full size).
export const ScaledPreview: React.FC<{ width: number }> = ({ width, children }) => {
    const outer = useRef<HTMLDivElement>(null)
    const inner = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)
    const [height, setHeight] = useState<number | undefined>(undefined)
    useEffect(() => {
        const measure = () => {
            if (!outer.current || !inner.current) return
            const s = Math.min(1, outer.current.clientWidth / width)
            setScale(s)
            setHeight(inner.current.offsetHeight * s)
        }
        measure()
        const RO = (window as any).ResizeObserver
        const observer = RO ? new RO(measure) : null
        if (observer) {
            observer.observe(outer.current)
            observer.observe(inner.current)
        } else window.addEventListener('resize', measure)
        return () => observer ? observer.disconnect() : window.removeEventListener('resize', measure)
    }, [width])
    return <div ref={outer} style={{ width: '100%', height, overflow: 'hidden' }}>
        <div ref={inner} style={{ width, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
    </div>
}
