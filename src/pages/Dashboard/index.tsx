import React from 'react';
import { Typography, Row, Col } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import api from '../../services/api';

import Header from '../../components/Header';

import { PageContainer } from './styles';

const Dashboard: React.FC = () => {
  const { data, isLoading, isError } = useQuery(
    'reports',
    async () => {
      const { data: responseData } = await api.get('/reports');

      return responseData;
    },
    { staleTime: 3000 },
  );

  const reportsGraphData = data?.map(day => {
    return { day: day.date, posts: day.posts, merits: day.merits };
  });

  return (
    <>
      <Header />
      <PageContainer>
        {isLoading || isError ? (
          <div style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
            {isError ? (
              <Typography.Text>
                We are having some trouble contacting the server...
              </Typography.Text>
            ) : (
              <LoadingOutlined style={{ fontSize: 50 }} />
            )}
          </div>
        ) : (
          <div>
            <Typography.Title level={2}>Work in progress...</Typography.Title>
            <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
              <Col md={24} lg={12}>
                <Typography.Title level={3}>Scraped Posts</Typography.Title>
                <LineChart
                  width={Math.min(window.innerWidth - 30, 500)}
                  height={300}
                  data={reportsGraphData}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis dataKey="posts" />
                  <Tooltip contentStyle={{ backgroundColor: '#1D1D1D' }} />
                  <Line type="monotone" dataKey="posts" stroke="#82ca9d" />
                </LineChart>
              </Col>
              <Col md={24} lg={12}>
                <Typography.Title level={3}>Scraped Merits</Typography.Title>
                <LineChart
                  width={Math.min(window.innerWidth - 30, 500)}
                  height={300}
                  data={reportsGraphData}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis dataKey="merits" />
                  <Tooltip contentStyle={{ backgroundColor: '#1D1D1D' }} />
                  <Line type="monotone" dataKey="merits" stroke="#8884d8" />
                </LineChart>
              </Col>
            </Row>
          </div>
        )}
      </PageContainer>
    </>
  );
};

export default Dashboard;
