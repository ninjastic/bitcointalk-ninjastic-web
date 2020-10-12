import React from 'react';
import { Collapse, ConfigProvider, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { format, addMinutes } from 'date-fns';
import parse from 'html-react-parser';
import DOMPurity from 'dompurify';

import direction from '../../services/direction';

interface Post {
  post_id: number;
  topic_id: number;
  title: string;
  author: string;
  author_uid: number;
  content: string;
  date: Date;
  board_id: number;
  board_name: string;
  archive: boolean;
}

interface Props {
  data: Post;
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

const AddressPostCollapse: React.FC<Props> = ({ data }) => {
  const postDirection = direction(data.content);

  const date = new Date(data.date);
  const formattedDate = format(
    addMinutes(date, date.getTimezoneOffset()),
    'yyyy-MM-dd HH:mm:ss',
  );

  return (
    <ConfigProvider direction={postDirection}>
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
                    href={`https://bitcointalk.org/index.php?topic=${data.topic_id}.msg${data.post_id}#msg${data.post_id}`}
                    style={{
                      fontWeight: 500,
                      wordWrap: 'break-word',
                    }}
                  >
                    {data.title}
                  </a>
                </div>
                <span style={{ fontWeight: 400 }}>
                  posted by{' '}
                  <a
                    style={{
                      fontWeight: 500,
                      color: `${textToColor(data.author)}`,
                    }}
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
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Link to={`/post/${data.post_id}`}>{data.post_id}</Link>
                <div>{data.board_name}</div>
              </div>
            </div>
          }
          key={data.post_id}
        >
          <div className="post">{parse(DOMPurity.sanitize(data.content))}</div>
        </Collapse.Panel>
      </Collapse>
    </ConfigProvider>
  );
};

export default AddressPostCollapse;
