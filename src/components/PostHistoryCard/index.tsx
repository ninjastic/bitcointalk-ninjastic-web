import React from 'react';
import { Card, Collapse, Timeline, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import parse from 'html-react-parser';
import DOMPurity from 'dompurify';
import {
  differenceInSeconds,
  add,
  formatDistanceToNow,
  formatDistance,
} from 'date-fns';

import api from '../../services/api';

interface Props {
  id: number;
  post_title: string;
  post_content: string;
  post_date: string;
}

const PostHistoryCard: React.FC<Props> = ({
  id,
  post_title,
  post_content,
  post_date,
}) => {
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
      new Date(post_date),
    );

    const nextCheck = formatDistanceToNow(
      add(new Date(post_date), { minutes: 5, seconds: 10 }),
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

  const titleChanged = post_title !== data.title;
  const contentChanged = post_content !== data.content;
  const secondsEditDifference = differenceInSeconds(
    new Date(post_date),
    new Date(data.date),
  );
  const formatEditDifference = formatDistance(
    new Date(post_date),
    new Date(data.date),
  );

  return (
    <Card title="Post Edit History">
      <Timeline>
        {data.deleted ? (
          <Timeline.Item color="red">
            <Typography.Text>
              Post was deleted
              {secondsEditDifference === 0
                ? ' after less than 5 minutes.'
                : ` after ${formatEditDifference}.`}
            </Typography.Text>
          </Timeline.Item>
        ) : null}
        {titleChanged ? (
          <Timeline.Item>
            <div style={{ marginBottom: 10 }}>
              <Typography.Text>Title changed from </Typography.Text>
              <Typography.Text code>{post_title}</Typography.Text>
              <Typography.Text> to </Typography.Text>
              <Typography.Text code>{data.title}</Typography.Text>
              <Typography.Text>
                {secondsEditDifference === 0
                  ? ' after less than 5 minutes.'
                  : ` after ${formatEditDifference}.`}
              </Typography.Text>
            </div>
          </Timeline.Item>
        ) : null}
        {contentChanged ? (
          <Timeline.Item>
            <div style={{ marginBottom: 10 }}>
              <Typography.Text>
                Post content was edited
                {secondsEditDifference === 0
                  ? ' after less than 5 minutes.'
                  : ` after ${formatEditDifference}.`}
              </Typography.Text>
            </div>
            <Collapse key="edited">
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
