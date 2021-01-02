import React from 'react';
import { Typography, Row, Col, Divider, Statistic } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import { addMinutes, sub, startOfDay, endOfDay, startOfMonth, endOfHour } from 'date-fns';
import { format } from 'date-fns-tz';

import api from '../../services/api';

import Header from '../../components/Header';
import AlertMessage from '../../components/AlertMessage';
import PostsLineChart from '../../components/PostsLineChart';

import { PageContent } from './styles';
import PostsBarChart from '../../components/PostsBarChart';

const { Title } = Typography;

const PostsTodayCard: React.FC = () => {
  const { data, isLoading } = useQuery(
    'postsPerHourToday',
    async () => {
      const currentDate = new Date();

      const currentDateUTC = addMinutes(currentDate, currentDate.getTimezoneOffset());
      const yesterdayDateUTC = sub(currentDateUTC, { days: 1 });

      const { data: responseData } = await api.get('/posts/count', {
        params: {
          from: yesterdayDateUTC.toISOString(),
          to: currentDateUTC.toISOString(),
        },
      });

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
  const { data, isLoading } = useQuery(
    'postsPerHourLast24h',
    async () => {
      const date = new Date();

      const fromDate = sub(date, { days: 1 });
      const toDate = sub(endOfHour(date), { hours: 1 });

      const { data: responseData } = await api.get('/posts/count', {
        params: { from: fromDate, to: toDate, interval: '1h' },
      });

      return responseData;
    },
    { refetchOnMount: false, refetchOnWindowFocus: false, retry: false },
  );

  return <PostsBarChart data={data?.data} loading={isLoading} dateFormat="HH:mm" />;
};

const PostsPerDayGraph: React.FC = () => {
  const { data, isLoading } = useQuery(
    'postsPerDay',
    async () => {
      const date = new Date();

      const fromDate = sub(startOfDay(date), { months: 2 });
      const toDate = sub(endOfDay(date), { days: 1 });

      const { data: responseData } = await api.get('/posts/count', {
        params: {
          from: fromDate,
          to: toDate.toISOString(),
          interval: '1d',
        },
      });

      responseData.data.pop();

      return responseData;
    },
    { refetchOnMount: false, refetchOnWindowFocus: false, retry: false },
  );

  return <PostsLineChart data={data?.data} loading={isLoading} dateFormat="dd MMM yyyy" />;
};

const PostsPerMonthGraph: React.FC = () => {
  const { data, isLoading } = useQuery(
    'postsPerMonth',
    async () => {
      const date = new Date();

      const lastYearMonth = startOfMonth(sub(date, { years: 2 }));
      const currentMonth = startOfMonth(date);

      const { data: responseData } = await api.get('/posts/count', {
        params: {
          from: format(lastYearMonth, "yyyy-MM-dd'T'HH:mm:ss"),
          to: format(currentMonth, "yyyy-MM-dd'T'HH:mm:ss"),
          interval: '1M',
        },
      });

      responseData.data.pop();

      return responseData;
    },
    { refetchOnMount: false, refetchOnWindowFocus: false, retry: false },
  );

  return <PostsLineChart data={data?.data} loading={isLoading} dateFormat="MMM yyyy" />;
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
