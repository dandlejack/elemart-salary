import { Button } from "antd";
import { SelectValue } from "antd/lib/select";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useState } from "react";
interface IProps {
    document: HTMLElement | null
    fullname: string;
    reportMonth: SelectValue

}
export const GeneratePDF: React.FC<IProps> = ({ document, fullname, reportMonth }) => {
    const [ready, setReady] = useState(false);
    const printPdf = () => {
        const input = document
        console.log(input)
        if (input !== null) {
            html2canvas(input, { scale:2 }).then(canvas => {
                
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'px', 'a4');
                var pageWidth = pdf.internal.pageSize.getWidth();
                var pageHeight = pdf.internal.pageSize.getHeight();
                const widthRatio = pageWidth / canvas.width;
                const heightRatio = pageHeight / canvas.height;
                const ratio = widthRatio > heightRatio ? heightRatio : widthRatio;
                const canvasWidth = canvas.width * ratio - 50;
                const canvasHeight = canvas.height * ratio;
                const marginX = (pageWidth - canvasWidth) / 2;
                const marginY = 20// 0 if use class page //(pageHeight - canvasHeight) / 2
                pdf.addImage(imgData, 'JPEG', marginX, marginY, canvasWidth, canvasHeight);
                pdf.save(`${fullname + ' ' + reportMonth?.toString().split('/')[0] }.pdf`);
            })
        }
    }
    return <Button onClick={printPdf} type="primary" style={{ backgroundColor: '#1B456B', borderColor: '#1B456B', position: 'absolute', right: 15 }} >PAYROLL Generate</Button>
    
}