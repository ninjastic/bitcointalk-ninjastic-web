import React from 'react';
import { Link } from 'react-router-dom';
import { ConfigProvider, Tooltip } from 'antd';
import { format, addMinutes } from 'date-fns';

import direction from '../../services/direction';

interface Post {
  post_id: number;
  topic_id: number;
  title: string;
  author: string;
  author_uid: number;
  content: string;
  date: string;
  board_id: number;
  board_name: string;
  archive: boolean;
}

interface Props {
  data: Post;
  number?: number;
}

const CompactPostCard: React.FC<Props> = ({ data, number }) => {
  const postDirection = direction(data.content);

  const date = new Date(data.date);
  const formattedDate = format(addMinutes(date, date.getTimezoneOffset()), 'yyyy-MM-dd HH:mm:ss');

  const postNumber = number ? ` (#${number})` : null;

  return (
    <ConfigProvider direction={postDirection}>
      <li className="post">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <a
              href={`https://bitcointalk.org/index.php?topic=${data.topic_id}.msg${data.post_id}#msg${data.post_id}`}
              style={{
                fontWeight: 500,
                fontSize: 16,
                wordWrap: 'break-word',
              }}
            >
              {data.post_id}
            </a>{' '}
            by{' '}
            <a
              style={{ fontWeight: 500 }}
              href={`https://bitcointalk.org/index.php?action=profile;u=${data.author_uid}`}
            >
              {data.author}
            </a>
            {data.archive ? ' and scraped on ' : ' on '}
            <span style={{ fontWeight: 500 }}>{formattedDate} UTC </span>
            {data.archive ? (
              <Tooltip title="This post was scraped by Loyce at this date. This may or may not represent the time and date the post was made.">
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
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <div>
                {data.board_name || '-'}
                <Link to={`/post/${data.post_id}`}>{postNumber}</Link>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ConfigProvider>
  );
};

export default CompactPostCard;
