import React from 'react';
import { Typography, Row, Col, Divider, Statistic } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import { sub, startOfDay, endOfDay, startOfMonth, endOfHour } from 'date-fns';
import { format } from 'date-fns-tz';

import api from '../../services/api';

import Header from '../../components/Header';
import AlertMessage from '../../components/AlertMessage';
import LineChart from '../../components/LineChart';

import { PageContent } from './styles';
import BarChart from '../../components/BarChart';

const { Title } = Typography;

const PostsTodayCard: React.FC = () => {
  const { data, isLoading } = useQuery(
    'postsPerHourToday',
    async () => {
      const fromDate = format(sub(new Date(), { days: 1 }), "yyyy-MM-dd'T'HH:mm:ss");
      const toDate = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");

      const { data: responseData } = await api.get('/posts/count', {
        params: {
          from: fromDate,
          to: toDate,
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

const MeritsTodayCard: React.FC = () => {
  const { data, isLoading } = useQuery(
    'meritsPerHourToday',
    async () => {
      const fromDate = format(sub(new Date(), { days: 1 }), "yyyy-MM-dd'T'HH:mm:ss");
      const toDate = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");

      const { data: responseData } = await api.get('/merits/count', {
        params: {
          from: fromDate,
          to: toDate,
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
    <Statistic title="Merits 24h" value={totalCount} valueRender={value => (isLoading ? <LoadingOutlined /> : value)} />
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

  return <BarChart data={data?.data} loading={isLoading} name="Merits" dateFormat="HH:mm" />;
};

const PostsPerDayGraph: React.FC = () => {
  const { data, isLoading } = useQuery(
    'postsPerDay',
    async () => {
      const fromDate = format(sub(startOfDay(new Date()), { months: 2 }), "yyyy-MM-dd'T'HH:mm:ss");
      const toDate = format(sub(endOfDay(new Date()), { days: 1 }), "yyyy-MM-dd'T'HH:mm:ss");

      const { data: responseData } = await api.get('/posts/count', {
        params: {
          from: fromDate,
          to: toDate,
          interval: '1d',
        },
      });

      responseData.data.pop();

      return responseData;
    },
    { refetchOnMount: false, refetchOnWindowFocus: false, retry: false },
  );

  return <LineChart data={data?.data} loading={isLoading} name="Posts" dateFormat="dd MMM yyyy" />;
};

const PostsPerMonthGraph: React.FC = () => {
  const { data, isLoading } = useQuery(
    'postsPerMonth',
    async () => {
      const fromDate = format(sub(startOfMonth(new Date()), { years: 2 }), "yyyy-MM-dd'T'HH:mm:ss");
      const toDate = format(startOfMonth(new Date()), "yyyy-MM-dd'T'HH:mm:ss");

      const { data: responseData } = await api.get('/posts/count', {
        params: {
          from: fromDate,
          to: toDate,
          interval: '1M',
        },
      });

      responseData.data.pop();

      return responseData;
    },
    { refetchOnMount: false, refetchOnWindowFocus: false, retry: false },
  );

  return <LineChart data={data?.data} loading={isLoading} name="Posts" dateFormat="MMM yyyy" />;
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
            <MeritsTodayCard />
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
