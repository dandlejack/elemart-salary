import ReactDOM from 'react-dom'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Payslip, PayslipProps, PAYSLIP_WIDTH } from './Payslip'

const waitForImages = (root: HTMLElement) => Promise.all(Array.from(root.querySelectorAll('img')).map(img =>
    img.complete ? Promise.resolve() : new Promise(resolve => { img.onload = img.onerror = resolve })))

// Renders each payslip off-screen at full size and puts one per A4 page in a single PDF.
// JPEG keeps a page around a few hundred KB (PNG made a single payslip ~15 MB).
export const savePayslipsPdf = async (slips: PayslipProps[], fileName: string, onProgress?: (done: number, total: number) => void) => {
    const host = document.createElement('div')
    // Behind the page content (the layout has an opaque background), not off-screen, so html2canvas renders it.
    host.style.cssText = `position:fixed;left:0;top:0;width:${PAYSLIP_WIDTH}px;z-index:-1;pointer-events:none;background:#fff`
    document.body.appendChild(host)
    try {
        const fonts = (document as any).fonts
        if (fonts && fonts.ready) await fonts.ready
        const pdf = new jsPDF('p', 'px', 'a4')
        const pageWidth = pdf.internal.pageSize.getWidth()
        const margin = 25
        for (let i = 0; i < slips.length; i++) {
            await new Promise<void>(resolve => ReactDOM.render(<Payslip {...slips[i]} />, host, () => resolve()))
            await waitForImages(host)
            const canvas = await html2canvas(host.firstElementChild as HTMLElement, { scale: 2, backgroundColor: '#ffffff' })
            const width = pageWidth - margin * 2
            const height = canvas.height * width / canvas.width
            if (i > 0) pdf.addPage()
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', margin, 20, width, height)
            if (onProgress) onProgress(i + 1, slips.length)
        }
        pdf.save(fileName)
    } finally {
        ReactDOM.unmountComponentAtNode(host)
        host.remove()
    }
}
