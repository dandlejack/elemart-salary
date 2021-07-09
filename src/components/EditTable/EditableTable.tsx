import { useEffect, useState } from 'react'
import { Button, Table, Popconfirm } from 'antd'
import {
    EditableCell,
    EditableRow,
} from './EditableCell';
import { TablePaginationConfig } from 'antd/lib/table';
import { EmployeeApi } from '../../api/EmployeeApi';
import { TableProps } from '../../types/EditTableTypes';



export const EditableTable: React.FC<TableProps> = (props: any) => {
    const [dataSources, setDataSource] = useState(props.oldData)
    const [count, setCount] = useState(props.startCount)
    const [showData, setShowData] = useState(0)
    useEffect(() => {
        if (props.checkEnter)
            handleAdd()
        return () => {

        };
    }, [props.checkEnter]);

    useEffect(() => {
        setDataSource(props.oldData)
    }, [props.oldData]);

    useEffect(() => {
        setShowData(props.showData)
    }, [props.showData]);

    useEffect(() => {
        dataSources.map((data: any, index: number) => {
            data.key = index + 1
            handleOperation(data);
            return data;
        });
        if (props.getData !== undefined) props.getData(dataSources)
    }, [dataSources])

    const handleOperation = (data: any) => {
        data.operation = (
            <Popconfirm
                title="Sure to delete?"
                onConfirm={() => handleDelete(data.key)}
            >
                <a style={{ color: 'red' }}>Delete</a>
            </Popconfirm>
        );
        return data.operation
    };

    const handleDelete = (key: number) => {
        const filterData = dataSources.filter((item: any) => item.key !== key)
        setDataSource(filterData);
        setCount(count - 1)
    };

    const handleSave = (row: any) => {
        if (props.tableName === 'salary-table') {
            row.social_security = row.salary >= 15000 ? 750 : row.salary * 0.05
            row.agent_tax = row.agent * 0.05
        } else if (props.tableName === 'petty-cash') {
            if (row.key === 1) {
                row.pettycash_total = (row.received_cash + row.received_bank) - (row.paid_cash + row.paid_bank)
            } else {
                const findLastestTotal = dataSources.find(data => data.key === row.key - 1)
                row.pettycash_total = findLastestTotal.pettycash_total + (row.received_cash + row.received_bank) - (row.paid_cash + row.paid_bank)
            }
            if(row.description === undefined){
                row.description = '-'
            }
        }
        const newData = [...dataSources];
        const index = newData.findIndex((item: any) => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        setDataSource(newData);
    };

    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };

    const mapColumns = (col: any) => {
        if (!col.editable) {
            return col;
        }
        const newCol = {
            ...col,
            onCell: (record: any) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                children: col.children,
                dataType: col.dataType,
                formType: props.formType,
                handleSave,
            }),
        };
        if (col.children) {
            newCol.children = col.children.map(mapColumns);
        }
        return newCol;
    };
    const canEditChildColumns = props.column.map(mapColumns);
    const handleAdd = () => {
        const storeData = {};
        props.column.forEach((data: any) => {
            if (data.children) {
                data.children.forEach((insideChildren: any) => {
                    if (insideChildren.dataType === 'number') {
                        Object.assign(storeData, { [insideChildren.dataIndex]: 0 });
                    } else {
                        Object.assign(storeData, { [insideChildren.dataIndex]: '-' });
                    }
                });
            } else {
                if (data.dataType === 'number') {
                    Object.assign(storeData, { [data.dataIndex]: 0 });
                } else if (data.dataType === 'action') {
                    Object.assign(storeData, { [data.dataIndex]: handleOperation(data) })
                } else {
                    Object.assign(storeData, { [data.dataIndex]: '-' });
                    Object.assign(storeData, { key: count });
                    Object.assign(storeData, { no: count });
                }
            }
        });

        const newData = {
            // key: count,
            ...storeData,
        };
        setCount(count + 1);
        setDataSource([...dataSources, newData]);
    }

    const AddBtn = () => {
        return (<>
            <Button onClick={handleAdd} style={{width:50,marginLeft:10,marginBottom:10}} type='primary' >
                +
            </Button>
        </>
        );
    };
    return <div>
        {props.tableName === 'petty-cash' ? <AddBtn /> : null }
        <Table
            columns={canEditChildColumns}
            dataSource={dataSources}
            components={components}
            bordered
            style={{ width: '100%' }}
            // pagination={props.ablePagination}
            pagination={{ pageSize: showData }}
            scroll={{ x: '100vw', y: '100%' }}
        />
    </div>
}