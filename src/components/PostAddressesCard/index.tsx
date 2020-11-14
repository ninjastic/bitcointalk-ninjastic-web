import React from 'react';
import { useInfiniteQuery } from 'react-query';
import { Typography, Collapse, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import api from '../../services/api';

import AddressAggregatorCard from '../AddressAggregatorCard/indes';

const { Text } = Typography;

const PostAddressesCard: React.FC<{ id: number }> = ({ id }) => {
  const { data, isLoading, isError, canFetchMore, isFetchingMore, fetchMore } = useInfiniteQuery(
    `addressesPost:${id}`,
    async (key, last = null) => {
      const { data: responseData } = await api.get('addresses/unique', {
        params: {
          post_id: id,
          last,
          limit: 100,
        },
      });

      return responseData;
    },
    {
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      getFetchMore: lastGroup => {
        if (!lastGroup.data.after_key) return false;

        return lastGroup.data.after_key;
      },
    },
  );

  if (isLoading) {
    return (
      <Collapse style={{ marginTop: 15, marginBottom: 25 }}>
        <Collapse.Panel header={<LoadingOutlined />} key="addresses" />
      </Collapse>
    );
  }

  if (isError) {
    return (
      <Collapse style={{ marginTop: 15, marginBottom: 25 }}>
        <Collapse.Panel header="Addresses" key="addresses">
          <Text type="secondary">Something went wrong...</Text>
        </Collapse.Panel>
      </Collapse>
    );
  }

  if (!data[0].data.addresses.length) {
    return (
      <Collapse style={{ marginTop: 15, marginBottom: 25 }}>
        <Collapse.Panel header="Addresses" key="addresses">
          <Text type="secondary">No results...</Text>
        </Collapse.Panel>
      </Collapse>
    );
  }

  return (
    <Collapse style={{ marginTop: 15, marginBottom: 25 }}>
      <Collapse.Panel header="Addresses" key={`addresses:post-${id}`}>
        {data.map((group, groupIndex, array) => {
          return (
            <div key={groupIndex}>
              {group.data.addresses.map(address => {
                return (
                  <div key={address.address}>
                    <AddressAggregatorCard
                      key={address.address}
                      coin={address.coin}
                      address={address.address}
                      count={address.count}
                    />
                  </div>
                );
              })}
              {groupIndex === array.length - 1 ? (
                <div style={{ marginTop: 15, textAlign: 'center' }}>
                  {canFetchMore ? (
                    <Button size="large" onClick={() => fetchMore()} disabled={!!isFetchingMore} style={{ width: 110 }}>
                      {isFetchingMore ? <LoadingOutlined /> : 'Load more'}
                    </Button>
                  ) : (
                    <Text type="secondary">You reached the end!</Text>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </Collapse.Panel>
    </Collapse>
  );
};

export default PostAddressesCard;
