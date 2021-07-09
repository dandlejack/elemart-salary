import { useRef } from "react"

export const PieChart:React.FC = () => {
    const ref = useRef<any>()
    return <canvas id='PieChart' ref={ref} />
}