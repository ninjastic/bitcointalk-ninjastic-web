import React from 'react';
import ReactApexCharts from 'react-apexcharts';
import numeral from 'numeral';
import { LoadingOutlined } from '@ant-design/icons';
import { renderToString } from 'react-dom/server';
import { fromUnixTime, format } from 'date-fns';
import { Card } from 'antd';

import { useSearchStore } from '../../stores/SearchStore';

interface Data {
  key_as_string: string;
  key: number;
  doc_count: number;
}

interface Params {
  data: Data[];
  loading: boolean;
  dateFormat: string;
}

const PostsBarChart: React.FC<Params> = ({ data, loading, dateFormat }) => {
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
      name: 'Posts',
      data: dataNormalized,
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
    colors: ['var(--primary-color)'],
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: true,
      },
    },
    yaxis: {
      labels: {
        formatter(val: number) {
          return val.toFixed(0);
        },
      },
      title: {
        text: 'Posts',
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
            Posts: {numeral(s[seriesIndex][dataPointIndex]).format('0,0')}
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

export default PostsBarChart;
