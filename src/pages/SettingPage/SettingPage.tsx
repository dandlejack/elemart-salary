import { Button, Input } from 'antd'
import React, { useEffect, useState } from 'react'

export const SettingPage: React.FC = () => {
    const [currentIp, setCurrentIp] = useState('');
    const [showCurrentIp, setShowCurrentIp] = useState('');
    useEffect(() => {
        const getIP = localStorage.getItem('storeIP')
        const show = getIP !== null ? setShowCurrentIp(getIP) : setShowCurrentIp('กรุณากรอกไอพี')
    }, []);
    const handleOnclick = e => {
        localStorage.setItem('storeIP', currentIp)
        window.location.reload()
    }

    return <div style={{ marginTop: 15, marginLeft: 15 }}>
        <div style={{marginBottom:15}}>
            <span>Current IP : {showCurrentIp} </span>
        </div>
        <div style={{ width: 300 }}>
            <Input placeholder='backend ip' style={{ width: 150, marginRight: 15 }} onChange={e => setCurrentIp(e.target.value)} /><Button type='primary' onClick={e => handleOnclick(e)} >update</Button>
        </div>
    </div>
}