import React from 'react';
import { Collapse, Timeline, Typography, Modal } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import parse from 'html-react-parser';
import DOMPurity from 'dompurify';
import { formatDistanceToNow } from 'date-fns';
import Diff from 'react-stylable-diff';

import api from '../../services/api';
import { useSearchStore } from '../../stores/SearchStore';

const { Text } = Typography;

interface Props {
  id: number;
  postTitle: string;
  postContent: string;
  postDate: string;
  postBoardId: number;
}

const PostHistoryCard: React.FC<Props> = ({ id, postTitle, postContent, postBoardId }) => {
  const store = useSearchStore();

  const { boards, setBoards } = store;

  useQuery(
    'boards',
    async () => {
      const { data: responseData } = await api.get('/boards/?raw=1');

      if (responseData.data && responseData.data.length) {
        setBoards(responseData.data);
      }

      return responseData;
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  const { data, isLoading, isError } = useQuery(
    `postHistory:${id}`,
    async () => {
      const { data: responseData } = await api.get(`posts/${id}/history`);

      if (responseData.post_id) {
        return responseData;
      }

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  if (isLoading) {
    return (
      <Collapse>
        <Collapse.Panel header={<LoadingOutlined />} key={id} />
      </Collapse>
    );
  }

  const nextCheck = data?.data?.next_check
    ? formatDistanceToNow(data.data.next_check, {
        addSuffix: true,
      })
    : null;

  const handleOnClickTitleDiff = (oldValue: string, newValue: string) => {
    Modal.info({
      title: 'Title difference',
      content: <Diff inputA={oldValue} inputB={newValue} type="sentences" />,
    });
  };

  const handleOnClickContentDiff = (oldValue: string, newValue: string) => {
    Modal.info({
      title: 'Content difference',
      content: <Diff inputA={oldValue} inputB={newValue} type="sentences" />,
      width: 650,
    });
  };

  return (
    <Collapse activeKey={`edit-${id}`} style={{ marginTop: 15 }} className="collapse-format">
      <Collapse.Panel header="Post Changes History" key={`edit-${id}`} showArrow={false}>
        {isError ? <Text>Something went wrong...</Text> : null}
        {!data.data.post_history.length ? <Text>No edit history was found for this post.</Text> : null}
        {data.data.next_check ? (
          <div>
            <Text style={{ fontWeight: 500 }}>Next check:</Text> {nextCheck || '?'}
          </div>
        ) : null}
        {data.data.post_history.length ? (
          <Timeline mode="left" style={{ marginTop: 5 }}>
            {data.data.post_history.map(post_history => {
              const titleChanged = post_history.title && postTitle !== post_history.title;
              const contentChanged = post_history.content && postContent !== post_history.content;
              const boardIdChanged = post_history.board_id && postBoardId !== post_history.board_id;

              return (
                <div key={post_history.id}>
                  {post_history.deleted ? (
                    <Timeline.Item color="red">
                      <Text>Post was deleted</Text>
                    </Timeline.Item>
                  ) : null}
                  {titleChanged ? (
                    <Timeline.Item color="orange">
                      <Text>Title changed from </Text>
                      <Text code>{postTitle}</Text>
                      <div>
                        <Text> to </Text>
                        <Text code>{post_history.title}</Text>
                        <Typography.Link
                          style={{ marginLeft: 3 }}
                          onClick={() => handleOnClickTitleDiff(postTitle, post_history.title)}
                        >
                          [difference]
                        </Typography.Link>
                      </div>
                    </Timeline.Item>
                  ) : null}
                  {boardIdChanged ? (
                    <Timeline.Item color="green">
                      <Text>Board changed from </Text>
                      <Text code>{boards.find(b => b.board_id === postBoardId)?.name}</Text>
                      <Text> to </Text>
                      <Text code>{boards.find(b => b.board_id === post_history.board_id)?.name}</Text>
                    </Timeline.Item>
                  ) : null}
                  {contentChanged ? (
                    <Timeline.Item>
                      <Text>Content was edited</Text>
                      <Typography.Link
                        style={{ marginLeft: 3 }}
                        onClick={() => handleOnClickContentDiff(postContent, post_history.content)}
                      >
                        [difference]
                      </Typography.Link>
                      <Collapse key="edited" style={{ marginTop: 3 }}>
                        <Collapse.Panel header="NEW CONTENT" key="edited">
                          <div className="post">{parse(DOMPurity.sanitize(post_history.content))}</div>
                        </Collapse.Panel>
                      </Collapse>
                    </Timeline.Item>
                  ) : null}
                </div>
              );
            })}
          </Timeline>
        ) : null}
      </Collapse.Panel>
    </Collapse>
  );
};

export default PostHistoryCard;
