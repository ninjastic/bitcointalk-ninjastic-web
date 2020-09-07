import React from 'react';
import { Card, Collapse, Timeline, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import parse from 'html-react-parser';
import DOMPurity from 'dompurify';
import { differenceInMinutes } from 'date-fns';

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
        <Collapse.Panel header={<LoadingOutlined />} key={id} />
      </Collapse>
    );
  }

  if (isError) {
    return (
      <Card title="Post Edit History">
        <Typography.Text>No history was found for this post.</Typography.Text>
      </Card>
    );
  }

  const titleChanged = post_title !== data.title;
  const contentChanged = post_content !== data.content;
  const minutesEditDifference = differenceInMinutes(
    new Date(post_date),
    new Date(data.date),
  );

  return (
    <Card title="Post Edit History">
      <Timeline>
        {titleChanged ? (
          <Timeline.Item>
            <div style={{ marginBottom: 10 }}>
              <Typography.Text>Title changed from </Typography.Text>
              <Typography.Text code>{post_title}</Typography.Text>
              <Typography.Text> to </Typography.Text>
              <Typography.Text code>{data.title}</Typography.Text>
              <Typography.Text>
                {minutesEditDifference === 0
                  ? ' In less than 5 minutes.'
                  : ` After ${minutesEditDifference} minutes.`}
              </Typography.Text>
            </div>
          </Timeline.Item>
        ) : null}
        {contentChanged ? (
          <Timeline.Item>
            <div style={{ marginBottom: 10 }}>
              <Typography.Text>
                Post content was edited
                {minutesEditDifference === 0
                  ? ' in less than 5 minutes.'
                  : ` after ${minutesEditDifference} minutes.`}
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
