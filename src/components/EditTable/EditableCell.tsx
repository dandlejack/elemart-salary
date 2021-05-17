import React, { useContext, useState, useEffect, createRef } from 'react';
import { Select, TimePicker, Form, DatePicker, Radio, Input, InputNumber } from 'antd';
import moment from 'moment';
import TH_LOCAL from 'antd/es/date-picker/locale/th_TH';
import { EmployeeApi } from '../../api/EmployeeApi';
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
export const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  dataType,
  tableType,
  record,
  formType,
  handleSave,
  handleDelete,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const [employeeData, setEmployeeData] = useState([] as Array<Object>)
  const inputRef = createRef<Input>();
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  useEffect(() => {
    if (dataIndex === 'fullname') {
      EmployeeApi.findAllEmployees().then(res => {
        setEmployeeData(res)
      })
    }
  }, []);

  const toggleEdit = () => {
    setEditing(!editing);
    if (record[dataIndex] !== '-') {
      if (dataType === 'date') {
        form.setFieldsValue({
          [dataIndex]: moment(record[dataIndex], 'DD/MM/YYYY'),
        });
      } else if (dataType === 'date_time') {
        form.setFieldsValue({
          [dataIndex]: moment(record[dataIndex], 'DD/MM/YYYY HH:mm'),
        });
      } else if (dataType === 'time') {
        form.setFieldsValue({
          [dataIndex]: moment(record[dataIndex], 'HH:mm'),
        });
      } else {
        form.setFieldsValue({ [dataIndex]: record[dataIndex] });
      }
    }
  };

  const save = async (e: any) => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      // const result:any = employeeData.filter((data:any)=>data.fullname===values.fullname) 
      // Object.assign(values,{salary:result[0].current_salary}) // Add current salary of employee      
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;
  if (editable) {
    if (editing) {
      if (dataType === 'radio') {
        childNode = (
          <Form.Item style={{ margin: 0 }} name={dataIndex}>
            {dataIndex === 'fruit_size' ? (
              <Radio.Group onChange={save}>
                <Radio value="ใหญ่">ใหญ่</Radio>
                <Radio value="กลาง">กลาง</Radio>
                <Radio value="เล็ก">เล็ก</Radio>
                <Radio value="ชิ้น">ชิ้น</Radio>
              </Radio.Group>
            ) : dataIndex === 'status' ? (
              <Radio.Group onChange={save}>
                <Radio value="สด">สด</Radio>
                <Radio value="เปลี่ยนมุ้ง">เปลี่ยนมุ้ง</Radio>
                <Radio value="คลุก">คลุก</Radio>
                <Radio value="อบใหม่">อบใหม่</Radio>
              </Radio.Group>
            ) : dataIndex === 'soaking_type' ? (
              <Radio.Group onChange={save}>
                <Radio value="บ่อแช่">บ่อแช่</Radio>
                <Radio value="ถัง">ถัง</Radio>
              </Radio.Group>
            ) : dataIndex === 'fruit_path' ? (
              <Radio.Group onChange={save}>
                <Radio value="NORMAL">Normal</Radio>
                <Radio value="SOFT">SOFT</Radio>
                <Radio value="FREE SUGAR">FREE SUGAR</Radio>
                <Radio value="FREE SO2">FREE SO2</Radio>
              </Radio.Group>
            ) : (
              <Radio.Group onChange={save}>
                <Radio value="ผ่าน">ผ่าน</Radio>
                <Radio value="ไม่ผ่าน">ไม่ผ่าน</Radio>
              </Radio.Group>
            )}
          </Form.Item>
        );
      } else if (dataType === 'date') {
        childNode = (
          <Form.Item style={{ margin: 0 }} name={dataIndex}>
            <DatePicker onBlur={save} format={'DD/MM/YYYY'} locale={TH_LOCAL} />
          </Form.Item>
        );
      } else if (dataType === 'date_time') {
        childNode = (
          <Form.Item style={{ margin: 0 }} name={dataIndex}>
            <DatePicker
              onBlur={save}
              showTime
              format={'DD/MM/YYYY HH:mm'}
              locale={TH_LOCAL}
            />
          </Form.Item>
        );
      } else if (dataType === 'time') {
        childNode = (
          <Form.Item style={{ margin: 0 }} name={dataIndex}>
            <TimePicker onBlur={save} />
          </Form.Item>
        );
      } else if (dataType === 'select') {
        childNode = (
          <Form.Item
            style={{ margin: 0 }}
            name={dataIndex}
            rules={[
              {
                required: true,
                message: `${title} is required.`,
              },
            ]}
          >
            {dataIndex === 'fullname' ? (
              <Select onBlur={save} showSearch>
                {employeeData.length > 0 && employeeData.map((data: any) => {
                  return <Select.Option key={data.employee_id} value={data.fullname}>{data.fullname}</Select.Option>
                })}
              </Select>
            ) : null}
          </Form.Item>
        );
      } else if (dataType === 'number') {
        childNode = (
          <Form.Item style={{ margin: 0 }} name={dataIndex}>
            <InputNumber min={0} onPressEnter={save} onBlur={save} />
          </Form.Item>
        );
      } else {
        childNode = (
          <Form.Item style={{ margin: 0 }} name={dataIndex}>
            <Input ref={inputRef} onPressEnter={save} onBlur={save} />
          </Form.Item>
        );
      }
    } else {
      childNode = (
        <div
          className="editable-cell-value-wrap"
          style={{ paddingRight: 24 }}
          onClick={toggleEdit}
        >
          {children}
        </div>
      );
    }
  }
  return <td {...restProps}>{childNode}</td>;
};
