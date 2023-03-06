import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { Typography, Button, Card, Table } from 'antd';
import { LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { format } from 'date-fns-tz';
import { subMonths } from 'date-fns';

import Header from '../../components/Header';
import DatePicker from '../../components/DatePicker';

import api from '../../services/api';

import { PageContent } from './styles';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

interface Board {
  name: string;
  key: number;
  count: number;
}

interface Response {
  total_results: number;
  boards: Board[];
}

const Boards: React.FC = () => {
  const history = useHistory();

  const [fromDate, setFromDate] = useState<string>(format(subMonths(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss"));
  const [toDate, setToDate] = useState<string>(format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"));

  const handleChangeDateRange = e => {
    const from = e && e[0] ? format(new Date(e[0]), "yyyy-MM-dd'T'HH:mm:ss") : '';
    const to = e && e[1] ? format(new Date(e[1]), "yyyy-MM-dd'T'HH:mm:ss") : '';

    setFromDate(from);
    setToDate(to);
  };

  const { isLoading, isError, data } = useQuery<Response>(
    ['boards:total', fromDate, toDate],
    async () => {
      const { data: responseData } = await api.get('boards/total', {
        params: {
          limit: 300,
          from: fromDate,
          to: toDate,
        },
      });

      return responseData.data;
    },
    {
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Post Count',
      dataIndex: 'count',
      key: 'count',
    },
  ];

  const tableData = data?.boards?.map(r => ({
    key: r.key,
    name: r.name,
    count: r.count,
  }));

  return (
    <div>
      <Header />
      <PageContent>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Button type="link" onClick={() => history.goBack()}>
            <ArrowLeftOutlined style={{ fontSize: 32 }} />
          </Button>
          <Title style={{ marginBottom: -5 }}>Boards</Title>
        </div>
        <div style={{ marginBottom: 15, marginTop: 15 }}>
          <RangePicker
            picker="date"
            defaultValue={[new Date(fromDate), new Date(toDate)]}
            onChange={handleChangeDateRange}
          />
        </div>
        {isLoading ? (
          <div style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
            <LoadingOutlined style={{ fontSize: 50 }} />
          </div>
        ) : null}
        {isError ? (
          <Card style={{ marginTop: 15, textAlign: 'center' }} key={1}>
            <Text type="secondary">Something went wrong</Text>
          </Card>
        ) : null}
        {!isLoading && !isError ? (
          <Table columns={columns} dataSource={tableData} size="small" pagination={{ pageSize: 100 }} bordered />
        ) : null}
      </PageContent>
    </div>
  );
};

export default Boards;
