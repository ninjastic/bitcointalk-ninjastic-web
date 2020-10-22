import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts';
import { format, addMinutes } from 'date-fns';
import { LoadingOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';

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

const formatDate = (value: string, dateFormat: string) => {
  const date = new Date(value);
  return format(addMinutes(date, date.getTimezoneOffset()), dateFormat);
};

const PostsBarChart: React.FC<Params> = ({ data, loading, dateFormat }) => {
  const isSmallScreen = useMediaQuery({ query: '(max-width: 850px)' });

  if (loading) {
    return (
      <LoadingOutlined style={{ fontSize: 24, margin: '30px 0 20px 0' }} />
    );
  }

  return (
    <ResponsiveContainer width="100%" aspect={isSmallScreen ? 2 / 1 : 2 / 0.5}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <Bar dataKey="doc_count" fill="var(--primary-color)" />
        <YAxis dataKey="doc_count" allowDecimals={false} />
        <XAxis
          dataKey="key_as_string"
          tickFormatter={value => formatDate(value, dateFormat)}
        />
        <Tooltip
          contentStyle={{ backgroundColor: 'var(--popover-background)' }}
          label="{timeTaken}"
          formatter={value => [value, 'Posts']}
          labelFormatter={(value: string) => {
            const date = formatDate(value, dateFormat);
            return `${date} (UTC)`;
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PostsBarChart;
