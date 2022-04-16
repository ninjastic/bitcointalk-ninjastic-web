import React from 'react';
import ReactApexCharts from 'react-apexcharts';
import numeral from 'numeral';
import { LoadingOutlined } from '@ant-design/icons';
import { renderToString } from 'react-dom/server';
import { fromUnixTime, format } from 'date-fns';
import { Card } from 'antd';
import { ApexOptions } from 'apexcharts';

import { useSearchStore } from '../../stores/SearchStore';

interface Data {
  key_as_string: string;
  key: number;
  doc_count: number;
}

interface Params {
  data: Data[];
  loading: boolean;
  name: string;
  dateFormat: string;
}

const LineChart: React.FC<Params> = ({ data, loading, name, dateFormat }) => {
  const { isDarkMode } = useSearchStore();

  if (loading) {
    return <LoadingOutlined style={{ fontSize: 42, margin: '42px 0 20px 0', textAlign: 'center', width: '100%' }} />;
  }

  const dataNormalized = data.map(d => {
    return {
      y: d.doc_count,
      x: d.key,
    };
  });

  const series = [
    {
      name,
      data: dataNormalized,
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: 'area',
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
      text: `Total: ${data.reduce((prev, curr) => prev + curr.doc_count, 0)}`,
      align: 'left',
    },
    colors: ['var(--primary-color)'],
    stroke: {
      width: 2.5,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: isDarkMode ? 'dark' : 'light',
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.25,
        opacityTo: 0,
        stops: [0, 90, 100],
      },
    },
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
            {name}
            :
            {' '}
            {numeral(s[seriesIndex][dataPointIndex]).format('0,0')}
          </Card>,
        );
      },
    },
    theme: {
      mode: isDarkMode ? 'dark' : 'light',
    },
  };

  return <ReactApexCharts options={options} series={series} type="area" height="350" />;
};

export default LineChart;
