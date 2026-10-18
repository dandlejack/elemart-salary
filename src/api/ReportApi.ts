import axios from "axios";
import { BACKEND_API } from "../config";


const REPORT_API = `${BACKEND_API}/reports`

// Requests throw on network/server errors so callers can show them; nothing reloads the page.
export class ReportApi {
    static async addReport(data: Object) {
        const res = await axios.post(`${REPORT_API}/AddReport`, data)
        return res.status === 201
    }

    static async findAllReports(params: any) {
        const res = await axios.get(`${REPORT_API}/findall`, { params })
        return res.data
    }

    // Without params: all reports. With employees_id/fullname: only reports containing that employee.
    static async findSalaryList(params: { employees_id?: string, fullname?: string }): Promise<Array<{ report_id: string, month_report: string }>> {
        const res = await axios.get(`${REPORT_API}/findSalaryList`, { params })
        return res.data || []
    }

    // Year-to-date totals for one employee up to and including the given report.
    static async findSumLateAndSecuritySocial(params: { report_id: string, employees_id?: string, fullname?: string }) {
        const res = await axios.get(`${REPORT_API}/findTotalSecuritySocialAndLate`, { params })
        return res.data
    }

    static async deleteReportById(report_id: string) {
        const res = await axios.delete(`${REPORT_API}/${report_id}`)
        return res.status === 200
    }

    static async updateReportByReportID(report_id: string, data: any) {
        const res = await axios.put(`${REPORT_API}/` + report_id, data)
        return res.data === 'successful'
    }

    static async findReportById(report_id: string) {
        const res = await axios.get(`${REPORT_API}/findall`, { params: { filterObject: { report_id } } })
        return res.data.length > 0 ? res.data[0] : null
    }
}
