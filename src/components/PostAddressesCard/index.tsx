import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Typography, Collapse } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import api from '../../services/api';

import AddressAuthorsCard from '../AddressAuthorsCard';
import AddressPostCard from '../AddressPostCard';

const PostAddressesCard: React.FC<{ id: number }> = ({ id }) => {
  const { data, isLoading, isError } = useQuery(
    `addressesPost:${id}`,
    async () => {
      const { data: responseData } = await api.get(`addresses/post/${id}`);

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  return (
    <Collapse style={{ marginTop: 15, marginBottom: 25 }}>
      <Collapse.Panel header="Addresses" key={`post-${id}`}>
        {isLoading ? (
          <LoadingOutlined style={{ fontSize: 50, color: '#fff' }} />
        ) : (
          <div>
            {isError ? (
              <Typography.Text>
                No BTC/ETH addresses were found on this post.
              </Typography.Text>
            ) : (
              <div>
                {data.map(address => (
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
                            {address.address} [{address.coin}] (
                            {address.posts_id.length})
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
                ))}
              </div>
            )}
          </div>
        )}
      </Collapse.Panel>
    </Collapse>
  );
};

export default PostAddressesCard;
