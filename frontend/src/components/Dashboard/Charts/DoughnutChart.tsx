import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string[];
      borderColor?: string[];
      borderWidth?: number;
    }[];
  };
  title?: string;
  height?: number;
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ data, title, height = 300 }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    cutout: '60%',
  };

  return (
    <div style={{ height: height }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default DoughnutChart;
