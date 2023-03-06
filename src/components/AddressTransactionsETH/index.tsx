import React from 'react';
import { useQuery } from 'react-query';
import { Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import api from '../../services/api';

import TransactionCard from '../AddressTransactionCardETH';

const { Text } = Typography;

interface Transaction {
  from: string;
  timestamp: number;
  to: string;
  tokenInfo: {
    address: string;
    name: string;
    decimals: string;
    symbol: string;
  };
  transactionHash: string;
  type: string;
  value: string;
}

interface QueryData {
  data: {
    operations: Transaction[];
  };
}

interface Params {
  address: string;
}

const AddressTransactionsETH: React.FC<Params> = ({ address }) => {
  const { data, isLoading, isError } = useQuery(
    `address:${address}:transactions`,
    async () => {
      const { data: responseData } = await api.get<QueryData>(`/addresses/${address}/details`, {
        params: {
          route: 'getAddressHistory',
        },
      });

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  if (isLoading) {
    return <LoadingOutlined />;
  }

  if (isError) {
    return <Text type="secondary">Something went wrong</Text>;
  }

  if (!data.data.operations.length) {
    return <Text>No token transactions...</Text>;
  }

  return (
    <div>
      {data.data.operations.map(operation => (
        <TransactionCard key={operation.transactionHash} rootAddress={address} transaction={operation} />
      ))}
      {data.data.operations.length >= 10 ? (
        <a
          href={`https://etherscan.io/address/${address}#tokentxns`}
          target="_blank"
          rel="noreferrer"
          style={{ float: 'right' }}
        >
          View full transaction history
        </a>
      ) : null}
    </div>
  );
};

export default AddressTransactionsETH;
