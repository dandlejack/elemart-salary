import { useEffect, useRef } from 'react'
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip } from 'chart.js'
import { formatMoney } from '../../utils/Salary'
import { fontFamily, tokens } from '../../theme/tokens'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)
Chart.defaults.font.family = fontFamily

// Single series, so no legend: the card title names it. The latest month is the strong bar.
const SERIES_COLOR = tokens.primaryMuted
const LATEST_COLOR = tokens.primary
const GRID_COLOR = tokens.outline
const AXIS_TEXT = tokens.textMuted

// Baht in compact form for the axis: 1,250,000 -> "1.25 ล้าน", 850,000 -> "850k".
const compactBaht = (value: number) => {
    if (Math.abs(value) >= 1000000) return `${Math.round(value / 10000) / 100} ล้าน`
    if (Math.abs(value) >= 1000) return `${Math.round(value / 1000)}k`
    return String(value)
}

interface Props {
    labels: string[]
    values: number[]
    // Tooltip label in front of the amount.
    valueLabel: string
}

export const MonthlyBarChart: React.FC<Props> = ({ labels, values, valueLabel }) => {
    const canvas = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
        if (!canvas.current) return
        const chart = new Chart(canvas.current, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: values.map((_, i) => i === values.length - 1 ? LATEST_COLOR : SERIES_COLOR),
                    hoverBackgroundColor: tokens.primaryStrong,
                    borderRadius: { topLeft: 4, topRight: 4 } as any,
                    borderSkipped: 'bottom',
                    maxBarThickness: 40,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        displayColors: false,
                        backgroundColor: tokens.onBackground,
                        cornerRadius: 10,
                        padding: 10,
                        callbacks: { label: ctx => `${valueLabel} ${formatMoney(ctx.parsed.y)} บาท` },
                    },
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: AXIS_TEXT } },
                    y: {
                        beginAtZero: true,
                        grid: { color: GRID_COLOR, drawBorder: false },
                        ticks: { color: AXIS_TEXT, maxTicksLimit: 5, callback: value => compactBaht(Number(value)) },
                    } as any,
                },
            },
        })
        return () => chart.destroy()
    }, [labels, values, valueLabel])

    return <div className='chart-box'>
        <canvas ref={canvas} role='img' aria-label={`${valueLabel}รายเดือน: ` + labels.map((label, i) => `${label} ${formatMoney(values[i])} บาท`).join(', ')} />
    </div>
}
