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
import {
  isValid,
  format,
  addMinutes,
  sub,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { useMediaQuery } from 'react-responsive';

import api from '../../services/api';

import Header from '../../components/Header';

import { PageContent } from './styles';

const { Text, Title } = Typography;

const PostsLast24HoursGraph: React.FC<{ isSmallScreen: boolean }> = ({
  isSmallScreen,
}) => {
  const { data, isLoading } = useQuery(
    'postsPerHourLast24h',
    async () => {
      const { data: responseData } = await api.get('/posts/count');

      return responseData;
    },
    { refetchOnMount: false, refetchOnWindowFocus: false, retry: false },
  );

  if (isLoading) {
    return (
      <div style={{ width: '100%', marginTop: 30, textAlign: 'center' }}>
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

const PostsTodayCard: React.FC = () => {
  const { data, isLoading } = useQuery(
    'postsPerHourToday',
    async () => {
      const currentDate = new Date();

      const currentDateUTC = addMinutes(
        currentDate,
        currentDate.getTimezoneOffset(),
      );
      const yesterdayDateUTC = sub(currentDateUTC, { days: 1 });

      const { data: responseData } = await api.get(
        `/posts/count?from=${yesterdayDateUTC.toISOString()}&to=${currentDateUTC.toISOString()}`,
      );

      return responseData;
    },
    { refetchOnMount: false, refetchOnWindowFocus: false, retry: false },
  );

  if (isLoading) {
    return (
      <Col xs={12} lg={6}>
        <Statistic
          title="Posts Today"
          valueRender={() => <LoadingOutlined />}
        />
      </Col>
    );
  }

  const totalCount = data.reduce((prev, current) => {
    return prev + current.doc_count;
  }, 0);

  return (
    <Col xs={12} lg={6}>
      <Statistic title="Posts Today" value={totalCount} />
    </Col>
  );
};

const Dashboard: React.FC = () => {
  const isSmallScreen = useMediaQuery({ query: '(max-width: 991px)' });

  const { data, isLoading, isError } = useQuery(
    'posts_count_24h',
    async () => {
      const currentDate = new Date();

      const currentDateUTC = addMinutes(
        currentDate,
        currentDate.getTimezoneOffset(),
      );

      const lastWeekDateUTC = sub(startOfDay(currentDateUTC), { months: 1 });
      const yesterdayDateUTC = sub(endOfDay(currentDateUTC), { days: 1 });

      const { data: responseData } = await api.get(
        `/posts/count?from=${lastWeekDateUTC.toISOString()}&to=${yesterdayDateUTC.toISOString()}&interval=1d`,
      );

      responseData.pop();

      return responseData;
    },
    { refetchOnMount: false, refetchOnWindowFocus: false, retry: false },
  );

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
          {format(addMinutes(date, date.getTimezoneOffset()), 'yyyy/MM/dd')}
        </text>
      </g>
    );
  };

  return (
    <>
      <Header />
      <PageContent>
        {isLoading || isError ? (
          <div style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
            {isError ? (
              <Text>We are having some trouble contacting the server...</Text>
            ) : (
              <LoadingOutlined style={{ fontSize: 50, color: '#fff' }} />
            )}
          </div>
        ) : (
          <div>
            <Row gutter={[24, 24]}>
              <PostsTodayCard />
            </Row>
            <Divider />
            <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
              <Col xs={24} lg={12}>
                <Title level={3}>Scraped Posts</Title>
                <ResponsiveContainer width="100%" aspect={2 / 1}>
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
                            ? format(
                                addMinutes(date, date.getTimezoneOffset()),
                                'yyyy/MM/dd',
                              )
                            : null
                        } (UTC)`;
                      }}
                      formatter={value => [value, 'Posts']}
                    />
                    <Line
                      dataKey="doc_count"
                      stroke="#8884d8"
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Col>
            </Row>
            <Row gutter={[24, 24]}>
              <Col xs={24}>
                <Title level={3}>Posts in the last 24 hours</Title>
                <PostsLast24HoursGraph isSmallScreen={isSmallScreen} />
              </Col>
            </Row>
          </div>
        )}
      </PageContent>
    </>
  );
};

export default Dashboard;
