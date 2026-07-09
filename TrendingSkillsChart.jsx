import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const TrendingSkillsChart = ({ trends = [] }) => {
  const data = {
    labels: trends.map(t => t.skill),
    datasets: [
      {
        label: 'Market Demand Index %',
        data: trends.map(t => t.demand_percentage),
        backgroundColor: 'rgba(99, 102, 241, 0.75)', // Indigo
        hoverBackgroundColor: '#06B6D4', // Glow Cyan on hover
        borderColor: '#4F46E5',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: 'y', // Makes the bar chart horizontal
    responsive: true,
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94A3B8',
          font: {
            family: 'Plus Jakarta Sans',
          },
        },
        max: 100,
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#E2E8F0',
          font: {
            family: 'Plus Jakarta Sans',
            weight: 'bold',
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false, // No need for legend in single-metric chart
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full h-80">
      <Bar data={data} options={options} />
    </div>
  );
};

export default TrendingSkillsChart;
