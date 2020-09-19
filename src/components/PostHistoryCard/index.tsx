import React from 'react';
import { Card, Collapse, Timeline, Typography, Modal } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import parse from 'html-react-parser';
import DOMPurity from 'dompurify';
import {
  differenceInSeconds,
  add,
  formatDistanceToNow,
  // formatDistance,
} from 'date-fns';
import Diff from 'react-stylable-diff';

import api from '../../services/api';
import { useSearchStore } from '../../stores/SearchStore';

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
  postDate,
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

  if (isError) {
    const diffSecondsPostMade = differenceInSeconds(
      new Date(),
      new Date(postDate),
    );

    const nextCheck = formatDistanceToNow(
      add(new Date(postDate), { minutes: 5, seconds: 10 }),
      { addSuffix: true, includeSeconds: true },
    );

    if (diffSecondsPostMade <= 310) {
      return (
        <Card title="Post Edit History">
          <div>
            <Typography.Text>
              This post was made less than 5 minutes ago, so it was not checked
              for edits.
            </Typography.Text>
          </div>

          <div style={{ marginTop: 10 }}>
            <Typography.Text style={{ fontWeight: 500 }}>
              Next check: {nextCheck}
            </Typography.Text>
          </div>
        </Card>
      );
    }

    return (
      <Card title="Post Edit History">
        <Typography.Text>
          No edit history was found for this post.
        </Typography.Text>
      </Card>
    );
  }

  const titleChanged = postTitle !== data.title;
  const contentChanged = postContent !== data.content;
  const boardIdChanged = postBoardId !== data.board_id;

  // const secondsEditDifference = differenceInSeconds(
  //   new Date(postDate),
  //   new Date(data.date),
  // );
  // const formatEditDifference = formatDistance(
  //   new Date(postDate),
  //   new Date(data.date),
  // );

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
    <Card title="Post Edit History">
      <Timeline mode="left">
        {data.deleted ? (
          <Timeline.Item color="red">
            <Typography.Text>Post was deleted</Typography.Text>
          </Timeline.Item>
        ) : null}
        {titleChanged ? (
          <Timeline.Item color="orange">
            <Typography.Text>Title changed from </Typography.Text>
            <Typography.Text code>{postTitle}</Typography.Text>
            <div>
              <Typography.Text> to </Typography.Text>
              <Typography.Text code>{data.title}</Typography.Text>
              <Typography.Link
                style={{ marginLeft: 3 }}
                onClick={() => handleOnClickTitleDiff(postTitle, data.title)}
              >
                (check diff)
              </Typography.Link>
            </div>
          </Timeline.Item>
        ) : null}
        {boardIdChanged ? (
          <Timeline.Item color="green">
            <Typography.Text>Board changed from </Typography.Text>
            <Typography.Text code>
              {boards.find(b => b.board_id === data.board_id)?.name}
            </Typography.Text>
            <Typography.Text> to </Typography.Text>
            <Typography.Text code>
              {boards.find(b => b.board_id === postBoardId)?.name}
            </Typography.Text>
          </Timeline.Item>
        ) : null}
        {contentChanged ? (
          <Timeline.Item>
            <Typography.Text>Content was edited</Typography.Text>
            <Typography.Link
              style={{ marginLeft: 3 }}
              onClick={() =>
                handleOnClickContentDiff(postContent, data.content)
              }
            >
              (check diff)
            </Typography.Link>
            <Collapse key="edited" style={{ marginTop: 3 }}>
              <Collapse.Panel header="New content" key="edited">
                {parse(DOMPurity.sanitize(data.content))}
              </Collapse.Panel>
            </Collapse>
          </Timeline.Item>
        ) : null}
      </Timeline>
    </Card>
  );
};

export default PostHistoryCard;
