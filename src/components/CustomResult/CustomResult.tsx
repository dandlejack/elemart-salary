import { cleanup } from "@testing-library/react"
import { Button, Result } from "antd"
import input from "antd/lib/input"
import React, { useEffect, useState } from "react"
import { useHistory } from "react-router"
import { CustomModal } from "../CustomModal/CustomModal"
interface IResultProps {
    countTime: number 
    visibility:boolean
}

export const CustomResult: React.FC<IResultProps> = ({ countTime,visibility }) => {
    const [countRefresh, setCountRefresh] = useState(countTime)
    const history = useHistory()
    let countToReset = countTime
    useEffect(() => {
        setInterval(() => {
            countToReset--
            setCountRefresh(countToReset)
            if (countToReset === 0) window.location.reload()
        }, 1000)
    }, [visibility])

    const visiblityClose = () => {
        history.go(0)
    }

    return <CustomModal modalTitle='' modalType="update-successful" modalForm={<Result status="success" title='อัพเดทข้อมูลเรียบร้อย' subTitle={`จะรีเฟรชภายใน ${countRefresh} วินาที`} extra={[<Button type='primary' onClick={e => history.go(0)}>Refresh</Button>]} />} modalWidth={800} modalVisible={visibility} getClose={visiblityClose} />

}