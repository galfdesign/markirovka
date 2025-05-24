import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface FlowChartProps {
  loops: { room?: string; flowRate?: number }[];
}

const FlowChart: React.FC<FlowChartProps> = ({ loops }) => {
  const data = {
    labels: loops.map((l, idx) => l.room ? l.room : `Петля ${idx + 1}`),
    datasets: [
      {
        label: 'Расход, л/мин',
        data: loops.map(l => l.flowRate ?? 0),
        backgroundColor: '#0071e3',
        borderRadius: 6,
        maxBarThickness: 32,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        ticks: { color: '#222', font: { size: 13, weight: 'bold' as const } },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#222', font: { size: 13 } },
        grid: { color: '#eee' },
      },
    },
    maintainAspectRatio: false,
  };
  return (
    <div style={{width: 320, height: 220, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 8}}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default FlowChart; 