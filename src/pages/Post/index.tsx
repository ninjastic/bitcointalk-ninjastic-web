import React from 'react';
import { useQuery } from 'react-query';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { Typography, Button } from 'antd';
import { LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons';

import Header from '../../components/Header';
import PostCard from '../../components/PostCard';
import PostAddressesCard from '../../components/PostAddressesCard';
import PostHistoryCard from '../../components/PostHistoryCard';

import api from '../../services/api';

import { PageContent } from './styles';

interface MatchParams {
  id: number;
}

const Post: React.FC = () => {
  const history = useHistory();
  const { id } = useRouteMatch().params as MatchParams;

  const { data, isLoading, isError } = useQuery(
    `post:${id}`,
    async () => {
      const { data: responseData } = await api.get(`posts/${id}`);

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

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
            Post {id}
          </Typography.Title>
        </div>
        {isLoading || isError ? (
          <div style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
            {isError ? (
              <Typography.Text>
                This post could not be found in our database.
              </Typography.Text>
            ) : (
              <LoadingOutlined style={{ fontSize: 50, color: '#fff' }} />
            )}
          </div>
        ) : (
          <div>
            <PostCard data={data} />
            <PostAddressesCard id={data.post_id} />
            <PostHistoryCard
              id={data.post_id}
              post_title={data.title}
              post_content={data.content}
              post_date={data.date}
            />
          </div>
        )}
      </PageContent>
    </>
  );
};

export default Post;
