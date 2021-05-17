import { DashboardPage } from "../pages/DashboardPage/DashboardPage";
import { EmployeeInfoPage } from "../pages/EmployeeInfo/EmployeeInfoPage";
import { EmployeePage } from "../pages/EmployeePage/EmployeePage";
import { SalaryInfoPage } from "../pages/SalaryListInfoPage/SalaryInfoPage";
import { SaralyListPage } from "../pages/SalaryListPage/SaralyListPage";
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
]