import React from 'react';
import { useQuery } from 'react-query';
import { Collapse, ConfigProvider, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { LoadingOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import parse from 'html-react-parser';
import DOMPurity from 'dompurify';

import api from '../../services/api';
import direction from '../../services/direction';

interface Props {
  postsId: number[];
}

const textToColor = (text: string) => {
  let hash = 0;
  if (text.length === 0) return hash;
  for (let i = 0; i < text.length; i += 1) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
    hash &= hash;
  }
  const rgb = [0, 0, 0];
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 255;
    rgb[i] = value;
  }
  return `hsl(${rgb[1]},  100%, 75%)`;
};

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

  const { data, isLoading, isError } = useQuery(
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
        <Collapse.Panel header={<LoadingOutlined />} key={ids} />
      </Collapse>
    );
  }

  if (isError) {
    return (
      <Collapse>
        <Collapse.Panel
          header={`Error loading posts ${ids}`}
          key={ids}
          disabled
        />
      </Collapse>
    );
  }

  return data.map(post => {
    const formattedDate = post
      ? format(new Date(post.date), 'dd/MM/yyyy hh:mm:ss')
      : null;

    const lastBoard = post.boards[post.boards.length - 1];
    const postDirection = direction(post.content);

    return (
      <ConfigProvider direction={postDirection} key={post.post_id}>
        <Collapse>
          <Collapse.Panel
            header={
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div>
                    <a
                      href={`https://bitcointalk.org/index.php?topic=${post.topic_id}.msg${post.post_id}#msg${post.post_id}`}
                      style={{
                        fontWeight: 500,
                        wordWrap: 'break-word',
                      }}
                    >
                      {post.title}
                    </a>
                  </div>
                  <span style={{ fontWeight: 400 }}>
                    posted by{' '}
                    <a
                      style={{
                        fontWeight: 500,
                        color: `${textToColor(post.author)}`,
                      }}
                      href={`https://bitcointalk.org/index.php?action=profile;u=${post.author_uid}`}
                    >
                      {post.author}
                    </a>
                    {post.archive ? ' and scrapped on ' : ' on '}
                    <span style={{ fontWeight: 500 }}>{formattedDate} </span>
                    {post.archive ? (
                      <Tooltip title="This post was scrapped by Loyce at this date. This may or may not represent the time and date the post was made.">
                        <span
                          style={{
                            borderBottom: '1px dotted white',
                            cursor: 'pointer',
                          }}
                        >
                          (archived)
                        </span>
                      </Tooltip>
                    ) : null}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Link to={`/post/${post.post_id}`}>{post.post_id}</Link>
                  <div>{lastBoard}</div>
                </div>
              </div>
            }
            key={post.id}
          >
            <div className="post">
              {parse(DOMPurity.sanitize(post.content))}
            </div>
          </Collapse.Panel>
        </Collapse>
      </ConfigProvider>
    );
  });
};

export default AddressPostCard;
