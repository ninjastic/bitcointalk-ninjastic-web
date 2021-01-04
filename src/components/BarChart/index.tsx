import React from 'react';
import ReactApexCharts from 'react-apexcharts';
import numeral from 'numeral';
import { LoadingOutlined } from '@ant-design/icons';
import { renderToString } from 'react-dom/server';
import { fromUnixTime } from 'date-fns';
import { format } from 'date-fns-tz';
import { Card } from 'antd';

import { useSearchStore } from '../../stores/SearchStore';

interface Date {
  x: number;
  y: number;
}

interface Params {
  data: Date[];
  loading: boolean;
  name: string;
  dateFormat: string;
}

const BarChart: React.FC<Params> = ({ data, loading, name, dateFormat }) => {
  const { isDarkMode } = useSearchStore();

  if (loading) {
    return <LoadingOutlined style={{ fontSize: 42, margin: '42px 0 20px 0', textAlign: 'center', width: '100%' }} />;
  }

  const series = [
    {
      name,
      data,
    },
  ];

  const options = {
    chart: {
      type: 'bar',
      stacked: false,
      height: 350,
      background: 'var(--body-background)',
      zoom: {
        type: 'x',
        enabled: false,
        autoScaleYaxis: true,
      },
    },
    title: {
      text: `Total: ${data.reduce((prev, curr) => prev + curr.y, 0)}`,
      align: 'left',
    },
    colors: ['var(--primary-color)'],
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
      },
    },
    yaxis: {
      labels: {
        formatter(val: number) {
          return val.toFixed(0);
        },
      },
      title: {
        text: name,
      },
      forceNiceScale: true,
      max: Math.max(...series[0].data.map(d => d.y)) + 1,
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      custom: ({ series: s, seriesIndex, dataPointIndex }) => {
        const date = fromUnixTime(series[0].data[dataPointIndex].x / 1000);
        const dateString = format(date, dateFormat);

        return renderToString(
          <Card size="small" title={dateString}>
            {name}: {numeral(s[seriesIndex][dataPointIndex]).format('0,0')}
          </Card>,
        );
      },
    },
    theme: {
      mode: isDarkMode ? 'dark' : 'light',
    },
  };

  return <ReactApexCharts options={options} series={series} type="bar" height="350" />;
};

export default BarChart;
