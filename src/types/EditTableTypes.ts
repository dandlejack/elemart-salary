export interface EditableRowProps {
    index: number;
    d: any;
}

export interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    children: React.ReactNode;
    dataIndex: string;
    dataType: string;
    record: any;
    handleSave: (record: any) => void;
    // Choices for `select` cells.
    options?: string[];
}

export interface TableProps {
    column: Array<Object>;
    // Receives the edited rows after every change.
    getData: Function;
    oldData: Array<Object>;
    // Rows per page; 0 shows all rows on one page with a sticky header.
    showData: number;
    tableName?: 'salary-table' | 'petty-cash';
    summary?: (pageData: readonly any[]) => React.ReactNode;
    rowClassName?: (record: any) => string;
    // Shows the per-row delete action (default true).
    deletable?: boolean;
    // Shows an "add row" button under the table.
    addable?: boolean;
    // Sticky header for full-page tables (default true); turn off inside modals.
    sticky?: boolean;
}
