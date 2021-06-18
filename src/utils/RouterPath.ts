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
        pathName: 'หน้าแรก',
        path: '/',
        component: DashboardPage,
        isMenu:true
    },
    {
        pathName: 'รายชื่อพนักงาน',
        path: '/employee',
        component: EmployeePage,
        isMenu:true
    },
    {
        pathName: 'รายการเงินเดือน',
        path: '/salary-list',
        component: SaralyListPage,
        isMenu:true
    },
    {
        pathName: 'EmployeeInfo',
        path: '/EmployeeInfo/:id',
        component: EmployeeInfoPage,
        isMenu:false
    },
    {
        pathName: 'ReportInfo',
        path: '/ReportInfo/:id',
        component: SalaryInfoPage,
        isMenu:false
    },
    {
        pathName: 'สมุดเงินสดย่อย',
        path: '/PettyCashBook',
        component: PettyCashBookPage,
        isMenu:true
    },
    {
        pathName: 'PettyCashInfo',
        path: '/PettyCashInfo/:id',
        component: PettyCashInfoPage,
        isMenu:false
    },
    {
        pathName: 'Setting',
        path: '/setting',
        component: SettingPage,
        isMenu:true
    },
]