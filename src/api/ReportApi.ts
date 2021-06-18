import axios from "axios";
import { BACKEND_API } from "../config";


const REPORT_API = `${BACKEND_API}/reports`

export class ReportApi {
    static async addReport(data: Object) {
        await axios.post(`${REPORT_API}/AddReport`, data).then(res => {
            if (res.status === 201) window.location.reload()
        })
    }

    static async findAllReports(params: any) {
        const result = await axios.get(`${REPORT_API}/findall`, { params }).then(res => {
            return res.data
        })
        return result
    }

    static async findSalaryList(params: any) {
        const result = await axios.get(`${REPORT_API}/findSalaryList`, { params }).then(res => {
            if (res.status === 200) return res.data
        })
        return result
    }
    static async findSumLateAndSecuritySocial(params: any) {
        const result = await axios.get(`${REPORT_API}/findTotalSecuritySocialAndLate`, { params }).then(res => {
            if (res.status === 200) return res.data
        })
        console.log(result)
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
}