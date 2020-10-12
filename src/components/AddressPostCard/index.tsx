import React from 'react';
import { useQuery } from 'react-query';
import { Button, Col, Collapse, Row } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import AddressPostCollapse from '../AddressPostCollapse';

interface Props {
  postsId: number[];
}

const AddressPostCard: React.FC<Props> = ({ postsId }) => {
  const ids = postsId.reduce((prev, current, i, array) => {
    if (i === 0) {
      return current;
    }
    if (i === array.length - 1) {
      return `${prev},${current}`;
    }
    return `${prev},${current}`;
  }, '');

  const { data, isLoading, refetch, isError } = useQuery(
    `addressesPostsData:${ids}`,
    async () => {
      const { data: responseData } = await api.get(`posts/${ids}`);

      if (responseData.post_id) {
        return [responseData];
      }

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  if (isLoading) {
    return (
      <Collapse>
        <Collapse.Panel
          header={<LoadingOutlined style={{ color: '#fff', fontSize: 16 }} />}
          key={ids}
        />
      </Collapse>
    );
  }

  if (isError) {
    return (
      <Collapse>
        <Collapse.Panel
          header={
            <div
              style={{
                display: 'flex',
                width: '100%',
                wordBreak: 'break-word',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span>
                Error loading {postsId.length} posts. Showing only unorganized
                links.
              </span>
              <Button
                type="ghost"
                onClick={() => refetch()}
                style={{ float: 'right', marginLeft: 'auto' }}
              >
                Retry
              </Button>
            </div>
          }
          key={ids}
        >
          <Row gutter={[4, 4]}>
            {postsId.map(postId => {
              return (
                <Col span={4}>
                  <Link to={`/post/${postId}`}>{postId}</Link>
                </Col>
              );
            })}
          </Row>
        </Collapse.Panel>
      </Collapse>
    );
  }

  return data.data.map(post => {
    return <AddressPostCollapse data={post} key={post.post_id} />;
  });
};

export default AddressPostCard;
