import React, { useContext, useState, useEffect, useRef } from 'react';
import { Select, Form, Input, InputNumber } from 'antd';
import { EditableRowProps, EditableCellProps } from '../../types/EditTableTypes';

const EditableContext = React.createContext<any>(null);

export const EditableRow: React.FC<EditableRowProps> = ({
  index,
  ...props
}) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

type Move = 'next' | 'prev' | 'down' | 'up'

// Opens the editable cell next to `td` (Tab / Shift+Tab move along the row, Enter moves down).
const openNeighbourCell = (td: HTMLTableCellElement | null, move: Move) => {
  if (!td) return
  let target: Element | null | undefined = null
  if (move === 'next' || move === 'prev') {
    const cells = Array.from(td.closest('tbody')?.querySelectorAll('td[data-editable="true"]') || [])
    target = cells[cells.indexOf(td) + (move === 'next' ? 1 : -1)]
  } else {
    const row = td.parentElement as HTMLTableRowElement
    const sibling = move === 'down' ? row.nextElementSibling : row.previousElementSibling
    target = (sibling as HTMLTableRowElement | null)?.cells?.[td.cellIndex]
  }
  const wrap = target?.querySelector('.editable-cell-value-wrap') as HTMLElement | null
  if (wrap) setTimeout(() => wrap.click(), 0)
}

export const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  dataType,
  record,
  handleSave,
  options,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<any>(null);
  const tdRef = useRef<HTMLTableCellElement>(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current.select) inputRef.current.select();
    }
  }, [editing]);

  const startEdit = () => {
    form.setFieldsValue({ [dataIndex]: record[dataIndex] === '-' ? '' : record[dataIndex] });
    setEditing(true);
  };

  const save = async (move?: Move) => {
    try {
      const values = await form.validateFields();
      setEditing(false);
      // An emptied number field means 0.
      if (dataType === 'number' && (values[dataIndex] === null || values[dataIndex] === undefined || values[dataIndex] === '')) values[dataIndex] = 0
      if (values[dataIndex] !== record[dataIndex]) handleSave({ ...record, ...values });
      if (move) openNeighbourCell(tdRef.current, move)
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      save(e.shiftKey ? 'prev' : 'next')
    } else if (e.key === 'Enter') {
      e.preventDefault()
      save(e.shiftKey ? 'up' : 'down')
    } else if (e.key === 'Escape') {
      setEditing(false)
    }
  }

  let childNode = children;
  if (editable) {
    if (editing) {
      if (dataType === 'select') {
        childNode = (
          <Form.Item style={{ margin: 0 }} name={dataIndex} rules={[{ required: true, message: `กรุณาเลือก${title}` }]}>
            <Select ref={inputRef} showSearch defaultOpen style={{ minWidth: 180 }} onBlur={() => save()} onChange={() => save()}>
              {(options || []).map((option: string) => <Select.Option key={option} value={option}>{option}</Select.Option>)}
            </Select>
          </Form.Item>
        );
      } else if (dataType === 'number') {
        childNode = (
          <Form.Item style={{ margin: 0 }} name={dataIndex}>
            <InputNumber ref={inputRef} min={0} style={{ width: '100%' }} onKeyDown={onKeyDown} onBlur={() => save()} />
          </Form.Item>
        );
      } else {
        childNode = (
          <Form.Item style={{ margin: 0 }} name={dataIndex}>
            <Input ref={inputRef} onKeyDown={onKeyDown} onBlur={() => save()} />
          </Form.Item>
        );
      }
    } else {
      childNode = (
        <div className="editable-cell-value-wrap" onClick={startEdit}>
          {children}
        </div>
      );
    }
  }
  return <td ref={tdRef} data-editable={editable ? 'true' : undefined} {...restProps}>{childNode}</td>;
};
