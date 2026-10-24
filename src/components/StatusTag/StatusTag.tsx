import { Tag } from 'antd'

// Employee status pill: green for working, neutral grey for resigned (resigning is not an error).
export const StatusTag: React.FC<{ resigned: boolean }> = ({ resigned }) => resigned
    ? <Tag className='status-tag status-tag-resigned'>ลาออก</Tag>
    : <Tag className='status-tag status-tag-active'>ทำงานอยู่</Tag>
