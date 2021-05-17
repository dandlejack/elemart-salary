import React, { useEffect, useState } from 'react'
import { Layout, Menu, PageHeader } from "antd";
import { RoutePath } from '../utils/RouterPath'
import { Page } from '../types/Page';
import { useHistory } from 'react-router-dom'
const { SubMenu } = Menu;
const { Content, Sider, Header } = Layout

export const SiderComponent: React.FC = () => {
    const [activePage, setActivePage] = useState(RoutePath[0].pathName);
    const history = useHistory()
    const navigatePage = (e: any, page: any) => {
        history.push(page.path)
        setActivePage(page.pathName);
    }
    
    return (
        <>
            <Sider theme="light" className='siderHeader'>
                <PageHeader title="ELEMART"  style={{height:72,borderBottom:'2px solid #e7e7e7'}} />
                <Menu
                    mode="inline"
                    activeKey={activePage}
                    defaultSelectedKeys={[activePage]}
                    style={{ borderRight: 0 }}
                >
                    {RoutePath.map((page: Page) => {
                        return page.isMenu ? <Menu.Item key={page.pathName} onClick={e => navigatePage(e, page)}>{page.pathName}</Menu.Item>:<></>
                    })}
                </Menu>
            </Sider>
        </>
    )
}