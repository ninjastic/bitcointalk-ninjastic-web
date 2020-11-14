import React from 'react';
import { useQuery } from 'react-query';
import { Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import api from '../../services/api';

const { Text, Title } = Typography;

interface Params {
  address: string;
}

const AddressDetailsBTC: React.FC<Params> = ({ address }) => {
  const { data, isLoading, isError } = useQuery(
    `address:${address}:details`,
    async () => {
      const { data: responseData } = await api.get(`/addresses/${address}/details`);

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  if (isError) {
    return (
      <div style={{ margin: '10px 5px' }}>
        <Text type="secondary">Something went wrong...</Text>
      </div>
    );
  }

  return (
    <div>
      <Title level={4}>Balance:</Title>
      {isLoading ? (
        <LoadingOutlined />
      ) : (
        <Text>{Number(data.data.data.confirmed_balance) + Number(data.data.data.unconfirmed_balance)} BTC</Text>
      )}
    </div>
  );
};

export default AddressDetailsBTC;
