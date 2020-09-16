import React from 'react';
import { useInfiniteQuery } from 'react-query';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { Typography, Divider, Button, Card } from 'antd';
import { LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';

import Header from '../../components/Header';

import api from '../../services/api';

import { PageContent } from './styles';
import PostCard from '../../components/PostCard';

interface Post {
  post_id: number;
  topic_id: number;
  title: string;
  author: string;
  author_uid: number;
  content: string;
  date: Date;
  boards: string[];
  board_id: number;
  archive: boolean;
}

interface ApiResponseHitsData {
  _id: string;
  _source: Post;
}

interface ApiResponseHits {
  hits: ApiResponseHitsData[];
}

interface ApiResponse {
  took: number;
  timed_out: boolean;
  hits: ApiResponseHits;
}

interface MatchParams {
  id: number;
}

const Topic: React.FC = () => {
  const history = useHistory();
  const { id } = useRouteMatch().params as MatchParams;

  const {
    isLoading,
    isFetching,
    isError,
    fetchMore,
    canFetchMore,
    data,
  } = useInfiniteQuery<ApiResponse>(
    'posts',
    async (key, lastId = 0) => {
      const { data: responseData } = await api.get(
        `posts?topic_id=${id}&last=${lastId}&limit=100`,
      );

      return responseData;
    },
    {
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      getFetchMore: lastGroup => {
        if (lastGroup.hits.hits.length < 100) return false;

        return lastGroup.hits.hits[lastGroup.hits.hits.length - 1]._id;
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
          <Typography.Text>You reached the end!</Typography.Text>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Header />
      <PageContent>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 15,
          }}
        >
          <Button type="link" onClick={() => history.goBack()}>
            <ArrowLeftOutlined style={{ fontSize: 32 }} />
          </Button>
          <Typography.Title style={{ marginBottom: -5 }}>
            Topic {id}
          </Typography.Title>
        </div>
        {isLoading && !data && !isError ? (
          <div style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
            <LoadingOutlined style={{ fontSize: 50, color: '#fff' }} />
          </div>
        ) : null}
        {isError ? (
          <div>
            <Typography.Text strong key={1}>
              Something went wrong...
            </Typography.Text>
          </div>
        ) : null}
        {data && !isLoading && !isError ? (
          <div>
            {data.map((group, groupIndex) => {
              if (!group.hits.hits.length) {
                return (
                  <div
                    style={{
                      width: '100%',
                      marginTop: 15,
                      textAlign: 'center',
                    }}
                  >
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: 16 }}
                      key={1}
                    >
                      No results...
                    </Typography.Text>
                  </div>
                );
              }

              return group.hits.hits.map((post_raw, i, array) => {
                const post = post_raw._source;

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
          </div>
        ) : null}
      </PageContent>
    </>
  );
};

export default Topic;
