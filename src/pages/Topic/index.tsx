import React, { useState } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { Typography, Divider, Button, Card, Radio, Tabs } from 'antd';
import { LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import numeral from 'numeral';

import Header from '../../components/Header';

import api from '../../services/api';

import PostCard from '../../components/PostCard';
import HeaderPostCard from '../../components/HeaderPostCard';
import CompactPostCard from '../../components/CompactPostCard';
import TopicAuthorsCard from '../../components/TopicAuthorsCard';

import { PageContent } from './styles';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface Post {
  post_id: number;
  topic_id: number;
  title: string;
  author: string;
  author_uid: number;
  content: string;
  date: Date;
  board_id: number;
  board_name: string;
  archive: boolean;
  created_at: Date;
  updated_at: Date;
}

interface Data {
  total_results: number;
  posts: Post[];
}

interface ApiResponse {
  timed_out: boolean;
  result: number;
  data: Data;
}

interface MatchParams {
  id: number;
}

const Topic: React.FC = () => {
  const history = useHistory();
  const [postsViewType, setPostsViewType] = useState('normal');

  const { id } = useRouteMatch().params as MatchParams;

  const {
    isLoading,
    isFetching,
    isError,
    fetchMore,
    canFetchMore,
    data,
  } = useInfiniteQuery<ApiResponse>(
    `posts:topic:${id}`,
    async (key, lastId = 0) => {
      const { data: responseData } = await api.get('posts', {
        params: {
          topic_id: id,
          last: lastId,
          order: 'ASC',
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
        if (lastGroup.data.posts.length < 100) return false;

        return lastGroup.data.posts[lastGroup.data.posts.length - 1].post_id;
      },
    },
  );

  useBottomScrollListener(() => {
    if (!canFetchMore || isFetching) return;

    fetchMore();
  }, 500);

  const LoadingMore = ({ groupIndex, onlyIcon = false }) => {
    if (groupIndex === data.length - 1) {
      if (!canFetchMore) {
        return (
          <div style={{ textAlign: 'center', marginTop: 25 }}>
            <Text>You reached the end!</Text>
          </div>
        );
      }

      return onlyIcon ? (
        <div style={{ width: '100%', marginTop: 30, textAlign: 'center' }}>
          <LoadingOutlined style={{ fontSize: 30, color: '#fff' }} />
        </div>
      ) : (
        <Card loading style={{ marginTop: 30 }} />
      );
    }
    return null;
  };

  return (
    <div>
      <Header />
      <PageContent>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Button type="link" onClick={() => history.goBack()}>
            <ArrowLeftOutlined style={{ fontSize: 32 }} />
          </Button>
          <Title style={{ marginBottom: -5 }}>Topic {id}</Title>
        </div>
        {isLoading ? (
          <div style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
            <LoadingOutlined style={{ fontSize: 50, color: '#fff' }} />
          </div>
        ) : null}
        {isError ? (
          <Card style={{ marginTop: 15, textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 16 }} key={1}>
              Something went wrong...
            </Text>
          </Card>
        ) : null}
        {data && !isLoading && !isError ? (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Posts" key="1">
              <div style={{ marginBottom: 15 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {data && !isLoading ? (
                    <Text>
                      <Text style={{ fontWeight: 500 }}>Posts:</Text>{' '}
                      {numeral(data[0].data.total_results || 0).format('0,0')}
                    </Text>
                  ) : null}
                  <Radio.Group
                    onChange={e => setPostsViewType(e.target.value)}
                    value={postsViewType}
                    defaultValue="normal"
                  >
                    <Radio.Button value="normal">Normal</Radio.Button>
                    <Radio.Button value="header">Header Only</Radio.Button>
                    <Radio.Button value="compact">Compact</Radio.Button>
                  </Radio.Group>
                </div>
              </div>
              {data.map((group, groupIndex) => {
                if (!group.data.posts.length) {
                  return (
                    <Card
                      style={{ marginTop: 15, textAlign: 'center' }}
                      key="NotFound"
                    >
                      <Text type="secondary" style={{ fontSize: 16 }} key={1}>
                        No results...
                      </Text>
                    </Card>
                  );
                }

                return group.data.posts.map((post, i, array) => {
                  switch (postsViewType) {
                    case 'normal':
                      return (
                        <div style={{ marginBottom: 30 }} key={post.post_id}>
                          <PostCard
                            data={post}
                            number={groupIndex * 100 + i + 1}
                          />
                          <Divider />
                          {i === array.length - 1 ? (
                            <LoadingMore groupIndex={groupIndex} />
                          ) : null}
                        </div>
                      );
                    case 'header':
                      return (
                        <div key={post.post_id}>
                          <HeaderPostCard
                            data={post}
                            number={groupIndex * 100 + i + 1}
                            style={{ marginBottom: 15 }}
                          />
                          {i === array.length - 1 ? (
                            <LoadingMore groupIndex={groupIndex} />
                          ) : null}
                        </div>
                      );
                    case 'compact':
                      return (
                        <ul
                          key={post.post_id}
                          style={{ paddingInlineStart: 20, marginBottom: 0 }}
                        >
                          <CompactPostCard
                            data={post}
                            number={groupIndex * 100 + i + 1}
                          />
                          {i === array.length - 1 ? (
                            <LoadingMore groupIndex={groupIndex} onlyIcon />
                          ) : null}
                        </ul>
                      );
                    default:
                      return null;
                  }
                });
              })}
            </TabPane>
            <TabPane tab="Users" key="2">
              <TopicAuthorsCard topicId={id} />
            </TabPane>
          </Tabs>
        ) : null}
      </PageContent>
    </div>
  );
};

export default Topic;
