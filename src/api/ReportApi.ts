import axios from "axios";
import { BACKEND_API } from "../config";


const REPORT_API = `${BACKEND_API}/reports`

export class ReportApi {
    static async addReport(data: Object) {
        const result = await axios.post(`${REPORT_API}/AddReport`, data).then(res => {
            if (res.status === 201) return true
        })
        return result
    }

    static async findAllReports(params: any) {
        const result = await axios.get(`${REPORT_API}/findall`, { params }).then(res => {
            return res.data
        })
        return result
    }

    // Without params: all reports. With employees_id/fullname: only reports containing that employee.
    static async findSalaryList(params: { employees_id?: string, fullname?: string }) {
        const result = await axios.get(`${REPORT_API}/findSalaryList`, { params }).then(res => {
            if (res.status === 200) return res.data
        })
        return result
    }

    // Year-to-date totals for one employee up to and including the given report.
    static async findSumLateAndSecuritySocial(params: { report_id: string, employees_id?: string, fullname?: string }) {
        const result = await axios.get(`${REPORT_API}/findTotalSecuritySocialAndLate`, { params }).then(res => {
            if (res.status === 200) return res.data
        })
        return result
    }
    static async deleteReportById(report_id: string) {
        const result = await axios.delete(`${REPORT_API}/${report_id}`).then(res => {
            if (res.status === 200) window.location.reload()
        })
    }

    static async updateReportByReportID(report_id,data:any){
        const result = await axios.put(`${REPORT_API}/`+report_id,data).then(res=>{
            if(res.data === 'successful') return true
        })
        return result
    }

    static async findReportById(report_id: string) {
        const result = await axios.get(`${REPORT_API}/findall`, { params: { filterObject: { report_id } } }).then(res => {
            return res.data.length > 0 ? res.data[0] : null
        })
        return result
    }

    static async findTest(params: any) {
        const result = await axios.get(`${REPORT_API}/getLateSalary`, { params }).then(res => {
            return res.data
        })
        return result
    }
}