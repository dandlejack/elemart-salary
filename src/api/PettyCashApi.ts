import { BACKEND_API } from '../config'
import axios from 'axios'
import { PettyCashDataProps } from '../types/StoreTypes'
const PETTYCASH_API_URL = `${BACKEND_API}/pettycashs`
export class PettyCashApi {
    static async findList() {
        const result = await axios.get(`${PETTYCASH_API_URL}/findlist`).then(res=>{
            return res.data
        })
        return result
    }

    static async insertPettyCashReport(data:PettyCashDataProps) {
        console.log(data)
        const result = await axios.post(`${PETTYCASH_API_URL}/addreport`,data).then(res=>{
            console.log(res)
            
        })
    }

    static async findReportByPettyCashId(pettyCashId:string){
        const result = await axios.get(`${PETTYCASH_API_URL}/${pettyCashId}`).then(res=>{
            return res.data
        })
        return result
    }
    
    static async updateReporyByPettyCashId(pettyCashId:string, data:any) {
        const result = await axios.put(`${PETTYCASH_API_URL}/${pettyCashId}`,data).then(res=>{
            if(res.data === 1) return true
        })
        return result
    }

    static async deleteReportByPettyCashId(pettyCashId:string) {
        console.log(pettyCashId)
        const result = await axios.delete(`${PETTYCASH_API_URL}/${pettyCashId}`).then(res=>{
            if(res.data === 1) return true
        })
        return result
    }

    
}