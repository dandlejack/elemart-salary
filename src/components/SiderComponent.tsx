import React from 'react'
import { Layout, Menu } from "antd";
import { RoutePath } from '../utils/RouterPath'
import { Page } from '../types/Page';
import { matchPath, useHistory, useLocation } from 'react-router-dom'
import logo from '../images/logo-com.png'
const { Sider } = Layout

// Detail pages highlight the menu they were opened from.
const PARENT_MENU: { [detailPath: string]: string } = {
    '/EmployeeInfo/:id': '/employee',
    '/ReportInfo/:id': '/salary-list',
    '/PettyCashInfo/:id': '/PettyCashBook',
}

const activeMenuPath = (pathname: string) => {
    const page = RoutePath.find(p => matchPath(pathname, { path: p.path, exact: true }))
    if (!page) return ''
    return PARENT_MENU[page.path] || page.path
}

export const SiderComponent: React.FC = () => {
    const history = useHistory()
    const location = useLocation()
    const activePath = activeMenuPath(location.pathname)

    return (
        // Collapses to a toggle button on small screens.
        <Sider theme="light" className='siderHeader' width={200} breakpoint='lg' collapsedWidth={0}>
            <div className='sider-logo' onClick={() => history.push('/')}>
                <img src={logo} alt='ELE-MART' />
                <span>ระบบเงินเดือน</span>
            </div>
            <Menu
                mode="inline"
                selectedKeys={[activePath]}
                style={{ borderRight: 0 }}
            >
                {RoutePath.filter((page: Page) => page.isMenu).map((page: Page) =>
                    <Menu.Item key={page.path} icon={page.icon} onClick={() => history.push(page.path)}>{page.pathName}</Menu.Item>
                )}
            </Menu>
        </Sider>
    )
}
