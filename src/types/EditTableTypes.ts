import { TablePaginationConfig } from "antd/lib/table";

export interface EditableRowProps {
    index: number;
    d: any;
}

export interface Item {
    product: string;
}

export interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    children: React.ReactNode;
    dataIndex: string;
    dataType: string;
    tableType: string;
    FixedType?:string;
    record: any;
    formType: string;
    handleSave: (record: Item) => void;
    handleDelete: (record: Item) => void;
}

export interface TableProps {
    column: Array<Object>;
    getData: Function;
    updateData?: boolean;
    oldData: Array<Object>;
    ablePagination: TablePaginationConfig;
    startCount: number;
    FixedType?:string;
    formType: string;
    checkEnter?: any;
    showData:number;
}