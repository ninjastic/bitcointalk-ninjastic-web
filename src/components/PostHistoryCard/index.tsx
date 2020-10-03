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

const PostHistoryCard: React.FC<Props> = ({
  id,
  postTitle,
  postContent,
  postBoardId,
}) => {
  const store = useSearchStore();

  const { boards, setBoards } = store;

  useQuery(
    'boardsRaw',
    async () => {
      const { data: responseData } = await api.get('/boards/?raw=1');

      if (responseData && responseData.length) {
        setBoards(responseData);
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
        <Collapse.Panel
          header={<LoadingOutlined style={{ color: '#fff' }} />}
          key={id}
        />
      </Collapse>
    );
  }

  const titleChanged = data?.title && postTitle !== data.title;
  const contentChanged = data?.content && postContent !== data.content;
  const boardIdChanged = data?.board_id && postBoardId !== data.board_id;

  const nextCheck = data?.next_check
    ? formatDistanceToNow(data.next_check, {
        addSuffix: true,
      })
    : null;

  const handleOnClickTitleDiff = (oldValue: string, newValue: string) => {
    Modal.info({
      title: 'Title difference',
      content: <Diff inputA={oldValue} inputB={newValue} type="words" />,
    });
  };

  const handleOnClickContentDiff = (oldValue: string, newValue: string) => {
    Modal.info({
      title: 'Content difference',
      content: <Diff inputA={oldValue} inputB={newValue} type="words" />,
      width: 650,
    });
  };

  return (
    <Collapse
      activeKey={`edit-${id}`}
      style={{ marginTop: 15 }}
      className="collapse-format"
    >
      <Collapse.Panel
        header="Post Changes History"
        key={`edit-${id}`}
        showArrow={false}
      >
        {isError ? (
          <Text>No edit history was found for this post.</Text>
        ) : (
          <Timeline mode="left" style={{ marginTop: 5 }}>
            {nextCheck ? (
              <Text>
                <Text style={{ fontWeight: 500 }}>Next check:</Text> {nextCheck}
              </Text>
            ) : null}
            {data.deleted ? (
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
                  <Text code>{data.title}</Text>
                  <Typography.Link
                    style={{ marginLeft: 3 }}
                    onClick={() =>
                      handleOnClickTitleDiff(postTitle, data.title)
                    }
                  >
                    [difference]
                  </Typography.Link>
                </div>
              </Timeline.Item>
            ) : null}
            {boardIdChanged ? (
              <Timeline.Item color="green">
                <Text>Board changed from </Text>
                <Text code>
                  {boards.find(b => b.board_id === data.board_id)?.name}
                </Text>
                <Text> to </Text>
                <Text code>
                  {boards.find(b => b.board_id === postBoardId)?.name}
                </Text>
              </Timeline.Item>
            ) : null}
            {contentChanged ? (
              <Timeline.Item>
                <Text>Content was edited</Text>
                <Typography.Link
                  style={{ marginLeft: 3 }}
                  onClick={() =>
                    handleOnClickContentDiff(postContent, data.content)
                  }
                >
                  [difference]
                </Typography.Link>
                <Collapse key="edited" style={{ marginTop: 3 }}>
                  <Collapse.Panel header="NEW CONTENT" key="edited">
                    <div className="post">
                      {parse(DOMPurity.sanitize(data.content))}
                    </div>
                  </Collapse.Panel>
                </Collapse>
              </Timeline.Item>
            ) : null}
          </Timeline>
        )}
      </Collapse.Panel>
    </Collapse>
  );
};

export default PostHistoryCard;
