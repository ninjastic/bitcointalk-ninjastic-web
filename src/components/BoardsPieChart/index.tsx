import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { LoadingOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

const { Text } = Typography;

interface BoardsData {
  name: string;
  count: number;
}

interface BoardsChartProps {
  data: BoardsData[];
  loading?: boolean;
}

const BoardsPieChart: React.FC<BoardsChartProps> = ({ data, loading }) => {
  const colors = [
    '#ED213A',
    '#F1BF98',
    '#00B4DB',
    '#ffb347',
    '#CB356B',
    '#fd746c',
    '#f46b45',
    '#11998e',
    '#396afc',
    '#7F00FF',
  ];

  if (loading) {
    return (
      <div style={{ height: 100, textAlign: 'center', marginTop: 50 }}>
        <LoadingOutlined style={{ fontSize: 36 }} />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div style={{ height: 100, textAlign: 'center', marginTop: 30 }}>
        <Text type="secondary">No data</Text>
      </div>
    );
  }
  const series = data.map(d => d.count);
  const labels = data.map(d => d.name);

  const options = {
    chart: {
      type: 'donut',
    },
    colors,
    labels,
    dataLabels: {
      dropShadow: {
        enabled: false,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            value: {
              color: 'var(--inverted-color)',
            },
          },
        },
      },
    },
    legend: {
      labels: {
        colors,
      },
      onItemHover: {
        highlightDataSeries: true,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  return <ReactApexChart options={options} series={series} type="donut" />;
};
export default BoardsPieChart;
