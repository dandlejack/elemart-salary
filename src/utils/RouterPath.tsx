import { DashboardOutlined, FileTextOutlined, SettingOutlined, TeamOutlined, WalletOutlined } from "@ant-design/icons";
import { DashboardPage } from "../pages/DashboardPage/DashboardPage";
import { EmployeeInfoPage } from "../pages/EmployeeInfo/EmployeeInfoPage";
import { EmployeePage } from "../pages/EmployeePage/EmployeePage";
import { PettyCashBookPage } from "../pages/PettyCashBookPage/PettyCashBookPage";
import { PettyCashInfoPage } from "../pages/PettyCashInfoPage/PettyCashInfoPage";
import { SalaryInfoPage } from "../pages/SalaryListInfoPage/SalaryInfoPage";
import { SaralyListPage } from "../pages/SalaryListPage/SaralyListPage";
import { SettingPage } from "../pages/SettingPage/SettingPage";
import { Page } from "../types/Page";

export const RoutePath: Page[] = [
    {
        pathName: 'ภาพรวม',
        path: '/',
        component: DashboardPage,
        isMenu: true,
        icon: <DashboardOutlined />
    },
    {
        pathName: 'พนักงาน',
        path: '/employee',
        component: EmployeePage,
        isMenu: true,
        icon: <TeamOutlined />
    },
    {
        pathName: 'รายงานเงินเดือน',
        path: '/salary-list',
        component: SaralyListPage,
        isMenu: true,
        icon: <FileTextOutlined />
    },
    {
        pathName: 'EmployeeInfo',
        path: '/EmployeeInfo/:id',
        component: EmployeeInfoPage,
        isMenu: false
    },
    {
        pathName: 'ReportInfo',
        path: '/ReportInfo/:id',
        component: SalaryInfoPage,
        isMenu: false
    },
    {
        pathName: 'สมุดเงินสดย่อย',
        path: '/PettyCashBook',
        component: PettyCashBookPage,
        isMenu: true,
        icon: <WalletOutlined />
    },
    {
        pathName: 'PettyCashInfo',
        path: '/PettyCashInfo/:id',
        component: PettyCashInfoPage,
        isMenu: false
    },
    {
        pathName: 'ตั้งค่า',
        path: '/setting',
        component: SettingPage,
        isMenu: true,
        icon: <SettingOutlined />
    },
]
