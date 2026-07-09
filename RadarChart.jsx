import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const RadarChart = ({ candidateSkills = [], requiredSkills = [] }) => {
  // Define categories to segment
  const categories = {
    "AWS/GCP/Azure Cloud": ["ec2", "s3", "lambda", "dynamodb", "cloudwatch", "vpc", "iam", "rds", "route53", "api gateway", "ecs", "eks", "virtual machines", "blob storage", "azure functions", "azure sql", "compute engine", "cloud storage", "bigquery"],
    "DevOps Automation": ["docker", "kubernetes", "jenkins", "terraform", "github actions", "devops", "ansible", "git", "ci/cd"],
    "Programming Systems": ["python", "java", "javascript", "sql", "typescript", "c#", "c++", "go"],
  };

  const getScores = () => {
    const candidateLower = candidateSkills.map(s => s.toLowerCase());
    const requiredLower = requiredSkills.map(s => s.toLowerCase());

    const labels = Object.keys(categories);
    const candidateData = [];
    const requiredData = [];

    labels.forEach(cat => {
      const skillsInCat = categories[cat];
      
      // Calculate how many of the required skills in this category the candidate has
      const reqInCat = requiredLower.filter(s => skillsInCat.some(c => s.includes(c) || c.includes(s)));
      const candInCat = candidateLower.filter(s => skillsInCat.some(c => s.includes(c) || c.includes(s)));
      
      const reqCount = reqInCat.length || 1; // avoid divide by zero
      // Map candidate skills overlap
      const matchedCount = candInCat.filter(s => reqInCat.includes(s)).length;
      
      // Convert to score percentage (cap at 100)
      const candScore = Math.min((matchedCount / reqCount) * 100.0, 100.0);
      
      candidateData.push(candScore);
      requiredData.push(100.0); // Required benchmark is always 100%
    });

    return { labels, candidateData, requiredData };
  };

  const { labels, candidateData, requiredData } = getScores();

  const data = {
    labels,
    datasets: [
      {
        label: 'Candidate Match %',
        data: candidateData,
        backgroundColor: 'rgba(6, 182, 212, 0.25)',
        borderColor: '#06B6D4',
        borderWidth: 2,
        pointBackgroundColor: '#06B6D4',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#06B6D4',
      },
      {
        label: 'Required Target Benchmark',
        data: requiredData,
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
        borderColor: 'rgba(99, 102, 241, 0.45)',
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointBackgroundColor: 'rgba(99, 102, 241, 0.5)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(99, 102, 241, 0.5)',
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.08)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
        },
        pointLabels: {
          color: '#94A3B8',
          font: {
            family: 'Plus Jakarta Sans',
            size: 11,
            weight: 'bold',
          },
        },
        ticks: {
          color: '#475569',
          backdropColor: 'transparent',
          beginAtZero: true,
          max: 100,
          stepSize: 20,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#E2E8F0',
          font: {
            family: 'Plus Jakarta Sans',
            size: 10,
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full h-64 md:h-80">
      <Radar data={data} options={options} />
    </div>
  );
};

export default RadarChart;
