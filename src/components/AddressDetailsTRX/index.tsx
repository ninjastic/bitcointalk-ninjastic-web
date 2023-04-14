import React from 'react';
import { useQuery } from 'react-query';
import { Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import api from '../../services/api';

const { Text, Title } = Typography;

interface Params {
  address: string;
}

const AddressDetailsTRX: React.FC<Params> = ({ address }) => {
  const { data, isLoading, isError } = useQuery(
    `address:${address}:details`,
    async () => {
      const { data: accountData } = await api.get('https://apilist.tronscanapi.com/api/accountv2', {
        params: {
          address,
        },
      });

      const { data: tokensData } = await api.get('https://apilist.tronscanapi.com/api/account/tokens', {
        params: {
          address,
        },
      });

      return {
        balance: accountData.balance,
        tokens: tokensData.data,
      };
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
      {isLoading ? <LoadingOutlined /> : <Text>{data.balance / 10e5} TRX</Text>}

      <Title level={4}>Tokens:</Title>
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {isLoading ? (
          <LoadingOutlined />
        ) : (
          data.tokens
            ?.filter(token => token.tokenId !== '_')
            .map(token => {
              const balance = token.balance / Number('1'.padEnd(Math.min(token.tokenDecimal, 30), '0')) / 10;
              return (
                <div key={token.owner_address}>
                  <img src={token.tokenLogo} alt={token.tokenName} width={24} height={24} />
                  <Text strong> - {token.tokenName}: </Text>
                  <Text>
                    {balance} {token.tokenAbbr}
                  </Text>
                </div>
              );
            }) || <Text>No tokens were found on this address</Text>
        )}
      </div>
    </div>
  );
};

export default AddressDetailsTRX;
