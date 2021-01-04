import React from 'react';
import ReactApexCharts from 'react-apexcharts';
import numeral from 'numeral';
import { LoadingOutlined } from '@ant-design/icons';
import { renderToString } from 'react-dom/server';
import { Card } from 'antd';

import { useSearchStore } from '../../stores/SearchStore';

interface Data {
  key: number;
  count: number;
}

interface Params {
  data: Data[];
  loading: boolean;
}

const TreeMap: React.FC<Params> = ({ data, loading }) => {
  const { isDarkMode } = useSearchStore();

  if (loading) {
    return <LoadingOutlined style={{ fontSize: 42, margin: '42px 0 20px 0', textAlign: 'center', width: '100%' }} />;
  }

  const dataNormalized = data.map(d => {
    return {
      x: d.key,
      y: d.count,
    };
  });

  const series = [
    {
      data: dataNormalized,
    },
  ];

  const options = {
    chart: {
      type: 'treemap',
      background: 'var(--body-background)',
      height: 350,
    },
    legend: {
      show: true,
    },
    title: {
      text: 'Top merit fans',
    },
    colors: ['#23A2F7'],
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
      },
      formatter(text, op) {
        return [text, op.value];
      },
      offsetY: -4,
    },
    tooltip: {
      custom: ({ series: s, seriesIndex, dataPointIndex }) => {
        return renderToString(
          <Card size="small">Merits: {numeral(s[seriesIndex][dataPointIndex]).format('0,0')}</Card>,
        );
      },
    },
    theme: {
      mode: isDarkMode ? 'dark' : 'light',
    },
  };

  // @ts-ignore
  return <ReactApexCharts options={options} series={series} type="treemap" />;
};

export default TreeMap;
