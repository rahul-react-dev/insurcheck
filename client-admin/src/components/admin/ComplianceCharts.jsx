import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

// Compliance Pass/Fail Pie Chart Component
export const CompliancePassFailChart = ({ data, loading = false }) => {
  const chartRef = useRef();

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { passed, failed } = data;
  const total = passed + failed;
  const passPercentage = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

  const chartData = {
    labels: ['Passed', 'Failed'],
    datasets: [
      {
        data: [passed, failed],
        backgroundColor: [
          '#10b981', // green-500
          '#ef4444', // red-500
        ],
        borderColor: [
          '#059669', // green-600
          '#dc2626', // red-600
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          '#059669',
          '#dc2626',
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
    // Accessibility
    elements: {
      arc: {
        borderWidth: 2,
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="h-64" role="img" aria-label={`Compliance pass/fail chart showing ${passPercentage}% pass rate`}>
        <Pie ref={chartRef} data={chartData} options={options} />
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{passed.toLocaleString()}</div>
          <div className="text-sm text-green-700">Passed ({passPercentage}%)</div>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{failed.toLocaleString()}</div>
          <div className="text-sm text-red-700">Failed ({(100 - passPercentage).toFixed(1)}%)</div>
        </div>
      </div>
    </div>
  );
};

// Common Issues Bar Chart Component
export const CommonIssuesChart = ({ data, loading = false }) => {
  const chartRef = useRef();

  if (loading || !data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        {loading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        ) : (
          <div className="text-gray-500">No data available</div>
        )}
      </div>
    );
  }

  const chartData = {
    labels: data.map(issue => issue.type),
    datasets: [
      {
        label: 'Issue Count',
        data: data.map(issue => issue.count),
        backgroundColor: [
          '#ef4444', // red-500
          '#f97316', // orange-500  
          '#eab308', // yellow-500
          '#06b6d4', // cyan-500
          '#8b5cf6', // violet-500
        ].slice(0, data.length),
        borderColor: [
          '#dc2626', // red-600
          '#ea580c', // orange-600
          '#ca8a04', // yellow-600
          '#0891b2', // cyan-600
          '#7c3aed', // violet-600
        ].slice(0, data.length),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = data[context.dataIndex];
            return `${context.label}: ${context.parsed.y.toLocaleString()} (${item.percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          callback: (value) => value.toLocaleString(),
        },
      },
    },
    // Accessibility
    elements: {
      bar: {
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="h-64" role="img" aria-label={`Common compliance issues chart showing ${data.length} issue types`}>
      <Bar ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

// Compliance Trends Line Chart Component
export const ComplianceTrendsChart = ({ data, loading = false }) => {
  const chartRef = useRef();

  if (loading || !data || !data.timeSeriesData || data.timeSeriesData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        {loading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        ) : (
          <div className="text-gray-500">No trend data available</div>
        )}
      </div>
    );
  }

  const chartData = {
    labels: data.timeSeriesData.map(point => {
      const date = new Date(point.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Pass Rate %',
        data: data.timeSeriesData.map(point => point.passRate),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#059669',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Pass Rate: ${context.parsed.y.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
    },
    // Accessibility
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        borderWidth: 2,
      },
    },
  };

  return (
    <div className="h-64" role="img" aria-label={`Compliance trends chart showing pass rate over ${data.timeSeriesData.length} time periods`}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default {
  CompliancePassFailChart,
  CommonIssuesChart,
  ComplianceTrendsChart,
};