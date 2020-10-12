import React from 'react';
import { useInfiniteQuery } from 'react-query';
import { LoadingOutlined } from '@ant-design/icons';
import { Divider, Card, Typography, Tabs } from 'antd';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';

import api from '../../services/api';

import Header from '../../components/Header';
import PostCard from '../../components/PostCard';

import { PageContent } from './styles';

const { Text } = Typography;

const LastDeletedPosts: React.FC = () => {
  const {
    data,
    isLoading,
    canFetchMore,
    fetchMore,
    isFetching,
  } = useInfiniteQuery(
    'lastDeletedPosts',
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
        if (lastGroup.data.posts_history.length < 20) return false;

        return lastGroup.data.posts_history[
          lastGroup.data.posts_history.length - 1
        ].created_at;
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

  if (isLoading) {
    return (
      <div style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
        <LoadingOutlined style={{ fontSize: 50, color: '#fff' }} />
      </div>
    );
  }

  return (
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
      {data &&
        data.map((group, groupIndex) => {
          if (!group.data.posts_history.length) {
            return (
              <div style={{ textAlign: 'center' }} key="NoResults">
                <Text type="secondary">No results.</Text>
              </div>
            );
          }

          return group.data.posts_history.map((post, i, array) => {
            return (
              <div style={{ marginBottom: 30 }} key={post.post_id}>
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
  );
};

const Patrol: React.FC = () => {
  return (
    <>
      <Header />
      <PageContent>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Last Deleted Posts" key="1">
            <LastDeletedPosts />
          </Tabs.TabPane>
        </Tabs>
      </PageContent>
    </>
  );
};

export default Patrol;
