import React from 'react';
import { useInfiniteQuery } from 'react-query';
import { LoadingOutlined } from '@ant-design/icons';
import { Divider, Card, Typography } from 'antd';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';

import api from '../../services/api';

import Header from '../../components/Header';
import PostCard from '../../components/PostCard';

import { PageContent } from './styles';

const { Text } = Typography;

const Deleted: React.FC = () => {
  const {
    data,
    isLoading,
    canFetchMore,
    fetchMore,
    isFetching,
  } = useInfiniteQuery(
    'deleted',
    async (key, last = '') => {
      const { data: responseData } = await api.get(
        `posts/history?deleted=true&last=${last}`,
      );

      return responseData;
    },
    {
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      getFetchMore: lastGroup => {
        if (lastGroup.hits.hits.length < 20) return false;

        return lastGroup.hits.hits[lastGroup.hits.hits.length - 1]._source
          .created_at;
      },
    },
  );

  useBottomScrollListener(() => {
    if (!canFetchMore || isFetching) return;

    fetchMore();
  }, 500);

  const LoadingMoreCard = ({ groupIndex }) => {
    if (groupIndex === data.length - 1) {
      return canFetchMore ? (
        <Card loading style={{ marginTop: 30 }} />
      ) : (
        <div style={{ textAlign: 'center', marginTop: 25 }}>
          <Text>You reached the end!</Text>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Header />
      <PageContent>
        {isLoading ? (
          <div style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
            <LoadingOutlined style={{ fontSize: 50, color: '#fff' }} />
          </div>
        ) : (
          <>
            <div
              style={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: 500 }}>
                Last Deleted Posts
              </Text>
              <Text type="secondary">within 5 minutes of created</Text>
            </div>
            {data.map((group, groupIndex) => {
              if (!group.hits.hits.length) {
                return (
                  <div style={{ textAlign: 'center' }} key="NoResults">
                    <Text type="secondary">No results.</Text>
                  </div>
                );
              }

              return group.hits.hits.map((postRaw, i, array) => {
                const post = postRaw._source;

                return (
                  <div style={{ marginBottom: 30 }} key={postRaw._id}>
                    <PostCard data={post} number={groupIndex * 100 + i + 1} />
                    <Divider />
                    {i === array.length - 1 ? (
                      <LoadingMoreCard groupIndex={groupIndex} />
                    ) : null}
                  </div>
                );
              });
            })}
          </>
        )}
      </PageContent>
    </>
  );
};

export default Deleted;
