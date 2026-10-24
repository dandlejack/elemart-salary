import React from 'react'
import { Layout, Space } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { HeaderProps } from '../types/StoreTypes'
const { Header } = Layout

// Sticky page title bar: optional back link on the left, page actions on the right.
// The optional eyebrow names the section above the title, so detail pages say where they belong.
export const HeaderComponent: React.FC<HeaderProps> = ({ eyebrow, title, subTitle, backPath, extra }) => {
    return <Header className="contentHeader">
        <div className='contentHeader-title'>
            {backPath ? <Link to={backPath} className='contentHeader-back' title='กลับ' aria-label='กลับ'><ArrowLeftOutlined /></Link> : null}
            <div className='contentHeader-heading'>
                {eyebrow ? <span className='eyebrow'>{eyebrow}</span> : null}
                <div className='contentHeader-line'>
                    <h1 className='contentHeader-text'>{title}</h1>
                    {subTitle ? <span className='contentHeader-subtitle'>{subTitle}</span> : null}
                </div>
            </div>
        </div>
        {extra ? <Space className='contentHeader-extra'>{extra}</Space> : null}
    </Header>
}
