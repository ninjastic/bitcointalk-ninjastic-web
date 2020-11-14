import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
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
  size: 'small' | 'large';
}

const formatDate = (value: string, dateFormat: string) => {
  const date = new Date(value);
  return format(addMinutes(date, date.getTimezoneOffset()), dateFormat);
};

const PostsLineChart: React.FC<Params> = ({ data, loading, dateFormat, size }) => {
  const isSmallScreen = useMediaQuery({ query: '(max-width: 850px)' });

  if (loading) {
    return <LoadingOutlined style={{ fontSize: 24, margin: '30px 0 20px 0' }} />;
  }

  return (
    <ResponsiveContainer width="100%" aspect={!isSmallScreen && size === 'large' ? 2 / 0.5 : 2 / 1}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <Line dataKey="doc_count" stroke="var(--primary-color)" type="monotone" />
        <YAxis dataKey="doc_count" allowDecimals={false} />
        <XAxis dataKey="key_as_string" tickFormatter={value => formatDate(value, dateFormat)} />
        <Tooltip
          contentStyle={{ backgroundColor: 'var(--popover-background)' }}
          label="{timeTaken}"
          formatter={value => [value, 'Posts']}
          labelFormatter={(value: string) => {
            const date = formatDate(value, dateFormat);
            return `${date} (UTC)`;
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PostsLineChart;
