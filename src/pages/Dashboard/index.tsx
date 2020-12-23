import React from 'react';
import { Typography, Row, Col, Divider, Statistic } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { isValid, format, addMinutes, sub, startOfDay, endOfDay } from 'date-fns';
import { useMediaQuery } from 'react-responsive';

import api from '../../services/api';

import Header from '../../components/Header';
import AlertMessage from '../../components/AlertMessage';
import PostsLineChart from '../../components/PostsLineChart';

import { PageContent } from './styles';

const { Title } = Typography;

const PostsTodayCard: React.FC = () => {
  const { data, isLoading } = useQuery(
    'postsPerHourToday',
    async () => {
      const currentDate = new Date();

      const currentDateUTC = addMinutes(currentDate, currentDate.getTimezoneOffset());
      const yesterdayDateUTC = sub(currentDateUTC, { days: 1 });

      const { data: responseData } = await api.get(
        `/posts/count?from=${yesterdayDateUTC.toISOString()}&to=${currentDateUTC.toISOString()}`,
      );

      return responseData;
    },
    { refetchOnMount: false, refetchOnWindowFocus: false, retry: false },
  );

  const totalCount = data?.data?.reduce((prev, current) => {
    return prev + current.doc_count;
  }, 0);

  return (
    <Statistic title="Posts 24h" value={totalCount} valueRender={value => (isLoading ? <LoadingOutlined /> : value)} />
  );
};

const PostsLast24HoursGraph: React.FC = () => {
  const isSmallScreen = useMediaQuery({ query: '(max-width: 991px)' });

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
      <div style={{ margin: '30px 0 20px 0' }}>
        <LoadingOutlined style={{ fontSize: 24 }} />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" aspect={2 / (isSmallScreen ? 1 : 0.5)}>
      <BarChart data={data?.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="key_as_string"
          tickFormatter={value => {
            const date = new Date(value);
            return format(addMinutes(date, date.getTimezoneOffset()), 'HH:mm');
          }}
        />
        <YAxis dataKey="doc_count" allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: 'var(--popover-background)' }}
          label="{timeTaken}"
          labelFormatter={value => {
            const date = new Date(value);
            const formatted = format(addMinutes(date, date.getTimezoneOffset()), 'HH:mm');

            return `${isValid(new Date(value)) ? formatted : null} (UTC)`;
          }}
          formatter={value => [value, 'Posts']}
        />
        <Bar dataKey="doc_count" fill="var(--primary-color)" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const PostsPerDayGraph: React.FC = () => {
  const { data, isLoading } = useQuery(
    'postsPerDay',
    async () => {
      const date = new Date();

      const dateUTC = addMinutes(date, date.getTimezoneOffset());
      const lastWeekDateUTC = sub(startOfDay(dateUTC), { months: 1 });
      const yesterdayDateUTC = sub(endOfDay(dateUTC), { days: 1 });

      const { data: responseData } = await api.get('/posts/count', {
        params: {
          from: lastWeekDateUTC.toISOString(),
          to: yesterdayDateUTC.toISOString(),
          interval: '1d',
        },
      });

      responseData.data.pop();

      return responseData;
    },
    { refetchOnMount: false, refetchOnWindowFocus: false, retry: false },
  );

  return <PostsLineChart data={data?.data} loading={isLoading} dateFormat="MM/dd" size="small" />;
};

const PostsPerMonthGraph: React.FC = () => {
  const { data, isLoading } = useQuery(
    'postsPerMonth',
    async () => {
      const date = new Date();

      const dateUTC = addMinutes(date, date.getTimezoneOffset());
      const lastWeekDateUTC = sub(startOfDay(dateUTC), { years: 1 });
      const yesterdayDateUTC = sub(endOfDay(dateUTC), { days: 1 });

      const { data: responseData } = await api.get('/posts/count', {
        params: {
          from: lastWeekDateUTC.toISOString(),
          to: yesterdayDateUTC.toISOString(),
          interval: '30d',
        },
      });

      responseData.data.pop();

      return responseData;
    },
    { refetchOnMount: false, refetchOnWindowFocus: false, retry: false },
  );

  return <PostsLineChart data={data?.data} loading={isLoading} dateFormat="yyyy/MM" size="small" />;
};

const Dashboard: React.FC = () => {
  return (
    <>
      <Header />
      <PageContent>
        <AlertMessage />
        <Row gutter={[24, 24]}>
          <Col xs={12} lg={8}>
            <PostsTodayCard />
          </Col>
          <Col xs={12} lg={8}>
            <Statistic title="Archived Posts" value="44 mil+" />
          </Col>
        </Row>
        <Divider />
        <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
          <Col xs={24} lg={12}>
            <Title level={3}>Posts per day</Title>
            <PostsPerDayGraph />
          </Col>
          <Col xs={24} lg={12}>
            <Title level={3}>Posts per month</Title>
            <PostsPerMonthGraph />
          </Col>
        </Row>
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Title level={3}>Posts in the last 24 hours</Title>
            <PostsLast24HoursGraph />
          </Col>
        </Row>
      </PageContent>
    </>
  );
};

export default Dashboard;
