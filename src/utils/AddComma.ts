import { IReportProps } from "../types/StoreTypes";

export const AddComma = (data: number) => {
    return data.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const AddCommaOfObject = (data: any) => {
    const keys = Object.keys(data)
    const obj = {} as IReportProps
    keys.map((key: string) => {
        if (typeof (data[key]) !== "string" && typeof (data[key]) !== "object") {
            const d = data[key].toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return Object.assign(obj, { [key]: d })
        }
    })
    return obj
}