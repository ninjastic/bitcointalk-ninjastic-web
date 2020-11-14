import React from 'react';
import { Collapse } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';

import api from '../../services/api';

import imageBTC from '../../assets/images/btc.png';
import imageETH from '../../assets/images/eth.png';

import AddressCard from '../AddressCard';

interface Props {
  address: string;
  coin: 'BTC' | 'ETH';
  count?: number;
  author?: string;
}

const AddressAggregatorCard: React.FC<Props> = ({ address, coin, count, author }) => {
  const icons = [
    {
      coin: 'ETH',
      image: imageETH,
    },
    {
      coin: 'BTC',
      image: imageBTC,
    },
  ];

  const { refetch, data, isLoading, isError } = useQuery(
    `address:${address}:aggregator`,
    async () => {
      const { data: responseData } = await api.get(`/addresses`, {
        params: {
          address,
          author,
        },
      });

      return responseData;
    },
    {
      enabled: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  return (
    <Collapse onChange={() => (!data?.data ? refetch() : null)}>
      <Collapse.Panel
        key={address}
        header={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex' }}>
              <img
                height={24}
                width={24}
                src={icons.find(i => i.coin === coin)?.image}
                alt={coin}
                style={{ marginRight: 5 }}
              />
              <div>
                <Link
                  to={`/address/${address}`}
                  style={{
                    fontWeight: 500,
                    fontSize: 16,
                    wordWrap: 'break-word',
                  }}
                >
                  {address} {count ? `(${count})` : null}
                </Link>
              </div>
            </div>
          </div>
        }
      >
        {isLoading ? (
          <div style={{ width: '100%', marginTop: 10, textAlign: 'center' }}>
            <LoadingOutlined style={{ fontSize: 32 }} />
          </div>
        ) : null}
        {isError ? 'Something went wrong...' : null}
        {data?.data?.addresses.map((record, index) => {
          return (
            <AddressCard data={record} number={index} key={`${record.address}_${record.post_id}`} showAddress={false} />
          );
        })}
      </Collapse.Panel>
    </Collapse>
  );
};

export default AddressAggregatorCard;
