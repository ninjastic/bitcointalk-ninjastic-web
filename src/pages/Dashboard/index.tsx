import React from 'react';
import { Typography, Row, Col, Divider, Statistic } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { isValid, format, addMinutes } from 'date-fns';
import { useMediaQuery } from 'react-responsive';

import api from '../../services/api';

import Header from '../../components/Header';

import { PageContent } from './styles';

const PostsPerHourGraph: React.FC<{ isSmallScreen: boolean }> = ({
  isSmallScreen,
}) => {
  const { data, isLoading } = useQuery(
    'postsPerHour24h',
    async () => {
      const { data: responseData } = await api.get('/posts/count');

      responseData.pop();

      return responseData;
    },
    { refetchOnMount: false, refetchOnWindowFocus: false, retry: false },
  );

  if (isLoading) {
    return (
      <div style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
        <LoadingOutlined style={{ color: '#fff', fontSize: 24 }} />
      </div>
    );
  }

  const CustomizedAxisTick: React.FC<{
    x: string;
    y: string;
    payload: { value: string };
  }> = ({ x, y, payload }) => {
    if (!payload.value) {
      return (
        <text
          x={Number(x) + 4.5}
          y={Number(y) / 2}
          dy={-10}
          fontSize={15}
          fill="#757575"
          dominantBaseline="middle"
          textAnchor="middle"
        >
          No data
        </text>
      );
    }

    const date = new Date(payload.value);

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={36} y={0} dy={16} textAnchor="end" fill="#666">
          {format(addMinutes(date, date.getTimezoneOffset()), 'HH:mm')}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" aspect={2 / (isSmallScreen ? 1 : 0.5)}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="key_as_string"
          tick={({ x, y, payload }) => (
            <CustomizedAxisTick x={x} y={y} payload={payload} />
          )}
        />
        <YAxis dataKey="doc_count" />
        <Tooltip
          contentStyle={{ backgroundColor: '#1D1D1D' }}
          label="{timeTaken}"
          labelFormatter={value => {
            const date = new Date(value);

            return `${
              isValid(new Date(value))
                ? format(addMinutes(date, date.getTimezoneOffset()), 'HH:mm')
                : null
            } (UTC)`;
          }}
          formatter={value => [value, 'Posts']}
        />
        <Line dataKey="doc_count" stroke="#8884d8" type="monotone" />
      </LineChart>
    </ResponsiveContainer>
  );
};

const Dashboard: React.FC = () => {
  const isSmallScreen = useMediaQuery({ query: '(max-width: 991px)' });

  const { data, isLoading, isError } = useQuery(
    'reports',
    async () => {
      const { data: responseData } = await api.get('reports');

      return responseData;
    },
    { refetchOnMount: false, refetchOnWindowFocus: false, retry: false },
  );

  const reportsGraphData = [];
  const todayData = [];

  if (data) {
    data.forEach((day, i, array) => {
      if (i === array.length - 1) {
        todayData.push({ posts: day.posts, merits: day.merits });
        return;
      }
      reportsGraphData.push({
        day: day.date,
        posts: day.posts,
        merits: day.merits,
      });
    });
  }

  return (
    <>
      <Header />
      <PageContent>
        {isLoading || isError ? (
          <div style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
            {isError ? (
              <Typography.Text>
                We are having some trouble contacting the server...
              </Typography.Text>
            ) : (
              <LoadingOutlined style={{ fontSize: 50, color: '#fff' }} />
            )}
          </div>
        ) : (
          <div>
            <Row gutter={[24, 24]}>
              <Col xs={12} lg={6}>
                <Statistic title="Posts Today" value={todayData[0].posts} />
              </Col>
              <Col xs={12} lg={6}>
                <Statistic title="Merits Today" value={todayData[0].merits} />
              </Col>
            </Row>
            <Divider />
            <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
              <Col xs={24} lg={12}>
                <Typography.Title level={3}>Scraped Posts</Typography.Title>
                <ResponsiveContainer width="100%" aspect={2 / 1}>
                  <LineChart data={reportsGraphData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" interval={4} />
                    <YAxis dataKey="posts" />
                    <Tooltip contentStyle={{ backgroundColor: '#1D1D1D' }} />
                    <Line dataKey="posts" stroke="#82ca9d" type="monotone" />
                  </LineChart>
                </ResponsiveContainer>
              </Col>
              <Col xs={24} lg={12}>
                <Typography.Title level={3}>Scraped Merits</Typography.Title>
                <ResponsiveContainer width="100%" aspect={2 / 1}>
                  <LineChart data={reportsGraphData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" interval={4} />
                    <YAxis dataKey="merits" />
                    <Tooltip contentStyle={{ backgroundColor: '#1D1D1D' }} />
                    <Line dataKey="merits" stroke="#8884d8" type="monotone" />
                  </LineChart>
                </ResponsiveContainer>
              </Col>
            </Row>
            <Row gutter={[24, 24]}>
              <Col xs={24}>
                <Typography.Title level={3}>
                  Posts in the last 24 hours
                </Typography.Title>
                <PostsPerHourGraph isSmallScreen={isSmallScreen} />
              </Col>
            </Row>
          </div>
        )}
      </PageContent>
    </>
  );
};

export default Dashboard;
