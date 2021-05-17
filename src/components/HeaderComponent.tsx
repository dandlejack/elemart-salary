import React,{useState} from 'react'
import { Button, Layout, Menu } from 'antd'
import { CustomModal } from './CustomModal/CustomModal'
import { HeaderProps } from '../types/StoreTypes'
const { Header } = Layout

export const HeaderComponent: React.FC<HeaderProps> = ({ title, linkPath, nameOfLinkPath, component, modalWidth }) => {
    const [visiblity, setVisiblity] = useState(false)
    const handleClick = () => {
        setVisiblity(true)
    }
    const handleClose = () => {
        setVisiblity(false)
    }
    return <Header className="contentHeader">
        <div style={{position:'relative'}}>
            <span>{title}</span>
            <Button className='createBtn' style={{  }} onClick={handleClick} >{nameOfLinkPath}</Button>
            <CustomModal modalTitle={nameOfLinkPath} modalType="paid-invoice" modalForm={component}  modalWidth={modalWidth} modalVisible={visiblity} getClose={handleClose} />
        </div>
    </Header>
}
