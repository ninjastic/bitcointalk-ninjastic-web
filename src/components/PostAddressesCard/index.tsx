import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Typography, Collapse } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import api from '../../services/api';

import AddressAuthorsCard from '../AddressAuthorsCard';
import AddressPostCard from '../AddressPostCard';

const { Text } = Typography;

const PostAddressesCard: React.FC<{ id: number }> = ({ id }) => {
  const { data, isLoading, isError } = useQuery(
    `addressesPost:${id}`,
    async () => {
      const { data: responseData } = await api.get('addresses', {
        params: {
          post_id: id,
        },
      });

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  return (
    <Collapse style={{ marginTop: 15, marginBottom: 25 }}>
      <Collapse.Panel header="Addresses" key={`post-${id}`}>
        {isLoading ? (
          <LoadingOutlined style={{ fontSize: 50 }} />
        ) : (
          <div>
            {isError ? <Text>Something went wrong...</Text> : null}
            {!data.data.addresses.length ? (
              <Text>No BTC/ETH addresses were found on this post.</Text>
            ) : null}
            {data.data
              ? data.data.addresses.map(address => (
                  <Collapse key={address.address}>
                    <Collapse.Panel
                      header={
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            wordWrap: 'break-word',
                            maxWidth: '100%',
                          }}
                        >
                          <Link
                            to={`/address/${address.address}`}
                            style={{
                              fontWeight: 500,
                              wordWrap: 'break-word',
                              maxWidth: '90%',
                            }}
                          >
                            {address.address} [{address.coin}]
                          </Link>
                        </div>
                      }
                      key={address.address}
                    >
                      <div style={{ marginBottom: 10 }}>
                        <AddressAuthorsCard address={address.address} />
                      </div>
                      <AddressPostCard postsId={address.posts_id} />
                    </Collapse.Panel>
                  </Collapse>
                ))
              : null}
          </div>
        )}
      </Collapse.Panel>
    </Collapse>
  );
};

export default PostAddressesCard;
