import React from 'react';
import { useQuery } from 'react-query';
import { Typography, Collapse } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import api from '../../services/api';

import AddressAggregatorCard from '../AddressAggregatorCard/indes';

const { Text } = Typography;

const PostAddressesCard: React.FC<{ id: number }> = ({ id }) => {
  const { data, isLoading, isError } = useQuery(
    `addressesPost:${id}`,
    async () => {
      const { data: responseData } = await api.get('addresses/unique', {
        params: {
          post_id: id,
        },
      });

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
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
          <Text>Something went wrong...</Text>
        </Collapse.Panel>
      </Collapse>
    );
  }

  return (
    <Collapse style={{ marginTop: 15, marginBottom: 25 }}>
      <Collapse.Panel
        header={`Addresses (${data.data.addresses.length})`}
        key={`post-${id}`}
      >
        {!data.data.addresses.length ? (
          <Text>No addresses were found on this post.</Text>
        ) : null}
        {data?.data
          ? data.data.addresses?.map(address => (
              <div style={{ marginTop: 15 }}>
                <AddressAggregatorCard
                  key={address.address}
                  coin={address.coin}
                  address={address.address}
                />
              </div>
            ))
          : null}
      </Collapse.Panel>
    </Collapse>
  );
};

export default PostAddressesCard;
