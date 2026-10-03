import { ReactChild } from "react";

export interface HeaderProps {
    title: string
    linkPath?: string
    nameOfLinkPath: string
    component?: any
    modalWidth?:number | string
}

export interface IDataProps {
    employees_id?:string
    absent:number
    agent: number
    agent_tax: number
    allowance: number
    bonus: number
    bonus_tax: number
    fuel: number
    fullname: string
    key: number
    late: number
    lending: number
    no: number
    operation: any
    overtime: number
    salary: number
    social_security?: number
    tax: number
    fund?: number
    note?: string
}

export interface PettyCashAttributesProps {
    date:number;
    description:string;
    received_cash:number;
    received_bank:number;
    paid_cash:number;
    paid_bank:number;
    pettycash_total:number;
}

export interface PettyCashDataProps {
    attributes:Array<PettyCashAttributesProps>;
    year_of_report:string;
    month_report: string;
}

export interface ModalProps {
    modalTitle: string;
    modalType: string;
    modalVisible: boolean;
    getClose: Function;
    modalForm?: ReactChild;
    modalWidth?:number | string;
}

export interface IReportMonthList {
    report_id: string;
    month_report: string;
}
export interface ITotalSocialAndLate {
    total_late: number;
    total_lending: number;
    total_absent: number;
    total_security_social: number;
    total_fund: number;
}
export interface IEmployeeProps {
    employees_id: string;
    firstname: string;
    lastname: string;
    fullname?: string;
    current_salary: number;
    total_social_security: number;
}

export interface IReportProps {
    absent:string
    agent: string
    agent_tax: string
    allowance: string
    bonus: string
    bonus_tax: string
    fuel: string
    fullname: string
    key: string
    late: string
    lending: string
    no: string
    operation?:any
    overtime: string
    salary: string
    social_security: string
    tax: string
    total_late: string;
    total_security_social: string;
    total_absent:string;
    total_lending:string
}