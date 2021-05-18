import { BACKEND_API } from '../config'
import axios from 'axios'
const EMPLOYEE_API_URL = `${BACKEND_API}/employees`
export class EmployeeApi {
    static async addEmployee(data: any) {
        const result = await axios.post(`${EMPLOYEE_API_URL}/addEmployee`,data).then(res=>{
            if(res.data.data === 'successful'){
                window.location.reload()
            }
        })
    }

    static async findAllEmployees() {
        const result = await axios.get(`${EMPLOYEE_API_URL}/findall`).then(res=>{
            if(res.status === 200) return res.data
        })
        return result
    }

    static async findEmployeeByEmployeeId(employee_id:string) {
        const result = await axios.get(`${EMPLOYEE_API_URL}/`+employee_id).then(res=>{
            if(res.status === 200) return res.data
        })
        
        return result
    }

    static async updateEmployeeByEmployeeId(employee_id,data:any){
        const result = await axios.put(`${EMPLOYEE_API_URL}/`+employee_id,data).then(res=>{
            if(res.data === 'successful') window.location.reload()
        })
    }
    
    static async deleteEmployeeByEmployeeId(employee_id:string){
        const result = await axios.delete(`${EMPLOYEE_API_URL}/`+employee_id).then(res=>{
             window.location.reload()
        })
    }
}