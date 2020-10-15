import React from 'react';
import { useQuery } from 'react-query';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { Typography, Button, Card } from 'antd';
import { LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons';

import Header from '../../components/Header';
import PostCard from '../../components/PostCard';
import PostAddressesCard from '../../components/PostAddressesCard';
import PostHistoryCard from '../../components/PostHistoryCard';

import api from '../../services/api';

import { PageContent } from './styles';

const { Text, Title } = Typography;

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
          <Title style={{ marginBottom: -5 }}>Post {id}</Title>
        </div>
        {isLoading ? (
          <div style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
            <LoadingOutlined style={{ fontSize: 50, color: '#fff' }} />
          </div>
        ) : null}
        {isError ? <Text>Something went wrong...</Text> : null}
        {!isLoading && data?.data.length ? (
          <div>
            <PostCard data={data.data[0]} />
            <PostHistoryCard
              id={data.data[0].post_id}
              postTitle={data.data[0].title}
              postContent={data.data[0].content}
              postDate={data.data[0].date}
              postBoardId={data.data[0].board_id}
            />
            <PostAddressesCard id={data.data[0].post_id} />
          </div>
        ) : null}
        {!isLoading && !data?.data.length ? (
          <Card style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
            <Text type="secondary">
              This post could not be found on our database.
            </Text>
          </Card>
        ) : null}
      </PageContent>
    </>
  );
};

export default Post;
