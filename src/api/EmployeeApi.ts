import { BACKEND_API } from '../config'
import axios from 'axios'
const EMPLOYEE_API_URL = `${BACKEND_API}/employees`

export type EmployeeStatus = 'active' | 'resigned'

export interface IEmployeeListItem {
    employee_id: string
    fullname: string
    current_salary: number
    social_security: number
    // Missing on backends without the status field; treated as active.
    status?: EmployeeStatus
    resigned_date?: string
}

// Requests throw on network/server errors so callers can show them; nothing reloads the page.
export class EmployeeApi {
    static async addEmployee(data: any) {
        const res = await axios.post(`${EMPLOYEE_API_URL}/addEmployee`, data)
        return res.data && res.data.data === 'successful'
    }

    static async findAllEmployees(): Promise<IEmployeeListItem[]> {
        const res = await axios.get(`${EMPLOYEE_API_URL}/findall`)
        return res.data || []
    }

    static async findEmployeeByEmployeeId(employee_id: string) {
        const res = await axios.get(`${EMPLOYEE_API_URL}/` + employee_id)
        return res.data
    }

    static async updateEmployeeByEmployeeId(employee_id: string, data: any) {
        const res = await axios.put(`${EMPLOYEE_API_URL}/` + employee_id, data)
        return res.data === 'successful'
    }

    static async setEmployeeStatus(employee_id: string, status: EmployeeStatus) {
        return EmployeeApi.updateEmployeeByEmployeeId(employee_id, { status })
    }

    static async deleteEmployeeByEmployeeId(employee_id: string) {
        await axios.delete(`${EMPLOYEE_API_URL}/` + employee_id)
        return true
    }
}

export const isResigned = (employee: { status?: string }) => employee.status === 'resigned'
