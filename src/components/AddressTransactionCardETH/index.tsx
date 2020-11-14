import React from 'react';
import { Typography, Card, Tag } from 'antd';
import { format, fromUnixTime } from 'date-fns';
import { useQuery } from 'react-query';

import { LoadingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import api from '../../services/api';

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

interface Address {
  address: string;
  coin: string;
  count: number;
  authors: Array<{
    key: string;
    doc_count: number;
  }>;
}

interface QueryData {
  data: {
    addresses: Address[];
  };
}

interface Params {
  rootAddress: string;
  transaction: Transaction;
}

const AddressTransactionCardETH: React.FC<Params> = ({ rootAddress, transaction }) => {
  const to = transaction.to.toLowerCase();
  const from = transaction.from.toLowerCase();

  const receiving = to === rootAddress.toLowerCase();
  const address = receiving ? from : to;

  const { data, isLoading, isError } = useQuery<QueryData>(
    `address:${address}`,
    async () => {
      const { data: responseData } = await api.get(`/addresses/unique?address=${address}`);

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  const value = Number(transaction.value) / Number('1'.padEnd(Number(transaction.tokenInfo.decimals), '0')) / 10;
  const formattedDate = format(fromUnixTime(transaction.timestamp), "yyyy-MM-dd HH:mm:ss 'UTC'");

  return (
    <Card key={transaction.transactionHash} style={{ marginBottom: 10 }}>
      {from === address ? (
        <Text>
          <Tag color="green">IN</Tag>Received{' '}
          <Text strong>
            {value} {transaction.tokenInfo.symbol}
          </Text>{' '}
          from{' '}
          <Link style={{ fontWeight: 500 }} to={`/address/${transaction.from}`}>
            {transaction.from}
          </Link>
        </Text>
      ) : (
        <Text>
          <Tag color="red">OUT</Tag>Sent{' '}
          <Text strong>
            {value} {transaction.tokenInfo.symbol}
          </Text>{' '}
          to{' '}
          <Link style={{ fontWeight: 500 }} to={`/address/${transaction.to}`}>
            {transaction.to}
          </Link>
        </Text>
      )}
      <div>
        <Text>{formattedDate}</Text>{' '}
        <a href={`http://etherscan.io/tx/${transaction.transactionHash}`} target="_blank" rel="noreferrer">
          (tx)
        </a>
      </div>
      {isLoading ? <LoadingOutlined /> : null}
      {!isLoading && !isError && data.data?.addresses?.length ? (
        <div>
          {data.data.addresses[0].authors?.map(({ key, doc_count }) => {
            return (
              <span key={key} style={{ marginRight: 10 }}>
                <Link to={`/user/${key}`}>
                  {key} ({doc_count})
                </Link>
              </span>
            );
          })}
        </div>
      ) : null}
    </Card>
  );
};

export default AddressTransactionCardETH;
