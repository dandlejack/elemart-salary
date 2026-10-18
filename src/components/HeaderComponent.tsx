import React from 'react'
import { Layout, Space } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { HeaderProps } from '../types/StoreTypes'
const { Header } = Layout

// Sticky page title bar: optional back link on the left, page actions on the right.
export const HeaderComponent: React.FC<HeaderProps> = ({ title, subTitle, backPath, extra }) => {
    return <Header className="contentHeader">
        <div className='contentHeader-title'>
            {backPath ? <Link to={backPath} className='contentHeader-back' title='กลับ'><ArrowLeftOutlined /></Link> : null}
            <span>{title}</span>
            {subTitle ? <span className='contentHeader-subtitle'>{subTitle}</span> : null}
        </div>
        {extra ? <Space className='contentHeader-extra'>{extra}</Space> : null}
    </Header>
}
