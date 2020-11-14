import React from 'react';
import { useQuery } from 'react-query';
import { Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import api from '../../services/api';

const { Text, Title } = Typography;

interface Params {
  address: string;
}

const AddressDetailsETH: React.FC<Params> = ({ address }) => {
  const { data, isLoading, isError } = useQuery(
    `address:${address}:details`,
    async () => {
      const { data: responseData } = await api.get(`/addresses/${address}/details`, {
        params: {
          route: 'getAddressInfo',
        },
      });

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

  const tokensFiltered = data?.data?.tokens?.filter((token, index, array) => {
    return array.map(mapObj => mapObj.tokenInfo.owner).indexOf(token.tokenInfo.owner) === index && token.tokenInfo.name;
  });

  return (
    <div>
      <Title level={4}>Balance:</Title>
      {isLoading ? <LoadingOutlined /> : <Text>{data.data.ETH.balance} ETH</Text>}

      <Title level={4}>Tokens:</Title>
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {isLoading ? (
          <LoadingOutlined />
        ) : (
          tokensFiltered?.map(token => {
            const balance = token.balance / Number('1'.padEnd(Math.min(token.tokenInfo.decimals, 30), '0')) / 10;
            return (
              <div key={token.tokenInfo.address}>
                <Text strong>- {token.tokenInfo.name}: </Text>
                <Text>
                  {balance} {token.tokenInfo.symbol}
                </Text>
              </div>
            );
          }) || <Text>No tokens were found on this address</Text>
        )}
      </div>
    </div>
  );
};

export default AddressDetailsETH;
