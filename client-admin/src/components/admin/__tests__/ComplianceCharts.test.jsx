import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  CompliancePassFailChart,
  CommonIssuesChart,
  ComplianceTrendsChart
} from '../ComplianceCharts';

// Mock Chart.js components
vi.mock('react-chartjs-2', () => ({
  Pie: vi.fn(({ data, options }) => (
    <div data-testid="pie-chart" data-chart-data={JSON.stringify(data)} />
  )),
  Bar: vi.fn(({ data, options }) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)} />
  )),
  Line: vi.fn(({ data, options }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)} />
  )),
}));

// Mock Chart.js registration
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  ArcElement: vi.fn(),
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  LineElement: vi.fn(),
  PointElement: vi.fn(),
}));

describe('ComplianceCharts', () => {
  describe('CompliancePassFailChart', () => {
    it('renders loading state', () => {
      render(<CompliancePassFailChart loading={true} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders chart with data', () => {
      const data = { passed: 150, failed: 25 };
      render(<CompliancePassFailChart data={data} />);
      
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      const data = { passed: 150, failed: 25 };
      render(<CompliancePassFailChart data={data} />);
      
      const chart = screen.getByRole('img');
      expect(chart).toHaveAttribute('aria-label', expect.stringContaining('Compliance pass/fail chart'));
    });

    it('calculates percentages correctly', () => {
      const data = { passed: 80, failed: 20 };
      render(<CompliancePassFailChart data={data} />);
      
      expect(screen.getByText('(80.0%)')).toBeInTheDocument();
      expect(screen.getByText('(20.0%)')).toBeInTheDocument();
    });
  });

  describe('CommonIssuesChart', () => {
    const mockData = [
      { type: 'Missing Fields', count: 10, percentage: 50 },
      { type: 'Invalid Format', count: 8, percentage: 40 },
      { type: 'Signature Failed', count: 2, percentage: 10 },
    ];

    it('renders loading state', () => {
      render(<CommonIssuesChart loading={true} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders chart with data', () => {
      render(<CommonIssuesChart data={mockData} />);
      
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('renders empty state with no data', () => {
      render(<CommonIssuesChart data={[]} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      render(<CommonIssuesChart data={mockData} />);
      
      const chart = screen.getByRole('img');
      expect(chart).toHaveAttribute('aria-label', expect.stringContaining('Common compliance issues chart'));
    });
  });

  describe('ComplianceTrendsChart', () => {
    const mockData = {
      timeSeriesData: [
        { date: '2024-01-01', passRate: 85 },
        { date: '2024-01-02', passRate: 90 },
        { date: '2024-01-03', passRate: 87 },
      ]
    };

    it('renders loading state', () => {
      render(<ComplianceTrendsChart loading={true} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders chart with data', () => {
      render(<ComplianceTrendsChart data={mockData} />);
      
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('renders empty state with no data', () => {
      render(<ComplianceTrendsChart data={null} />);
      expect(screen.getByText('No trend data available')).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      render(<ComplianceTrendsChart data={mockData} />);
      
      const chart = screen.getByRole('img');
      expect(chart).toHaveAttribute('aria-label', expect.stringContaining('Compliance trends chart'));
    });
  });
});