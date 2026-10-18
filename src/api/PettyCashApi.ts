import { BACKEND_API } from '../config'
import axios from 'axios'
import { PettyCashDataProps } from '../types/StoreTypes'
const PETTYCASH_API_URL = `${BACKEND_API}/pettycashs`

// UI-only fields (the editable table's delete button) must not be stored.
const stripUiFields = (rows: any[]) => (rows || []).map(({ operation, ...row }) => row)

// Requests throw on network/server errors so callers can show them.
export class PettyCashApi {
    static async findList() {
        const res = await axios.get(`${PETTYCASH_API_URL}/findlist`)
        return res.data || []
    }

    static async insertPettyCashReport(data: PettyCashDataProps) {
        const res = await axios.post(`${PETTYCASH_API_URL}/addreport`, { ...data, attributes: stripUiFields(data.attributes) })
        return res.data && res.data.data === 'successful'
    }

    static async findReportByPettyCashId(pettyCashId: string) {
        const res = await axios.get(`${PETTYCASH_API_URL}/${pettyCashId}`)
        return res.data
    }

    static async updateReporyByPettyCashId(pettyCashId: string, attributes: any[]) {
        const res = await axios.put(`${PETTYCASH_API_URL}/${pettyCashId}`, stripUiFields(attributes))
        return res.data === 1
    }

    static async deleteReportByPettyCashId(pettyCashId: string) {
        const res = await axios.delete(`${PETTYCASH_API_URL}/${pettyCashId}`)
        return res.status === 200
    }
}
