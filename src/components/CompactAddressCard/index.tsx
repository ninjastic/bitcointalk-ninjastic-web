import React from 'react';
import { Link } from 'react-router-dom';
import { ConfigProvider, Typography } from 'antd';
import { format, addMinutes } from 'date-fns';

import direction from '../../services/direction';

const { Text } = Typography;

interface Address {
  address: string;
  coin: string;
  post_id: number;
  topic_id: number;
  title: string;
  author: string;
  author_uid: number;
  content: string;
  date: string;
  board_id: number;
  board_name: string;
}

interface Props {
  data: Address;
  number?: number;
}

const CompactAddressCard: React.FC<Props> = ({ data, number }) => {
  const postDirection = direction(data.content);

  const date = new Date(data.date);
  const formattedDate = format(
    addMinutes(date, date.getTimezoneOffset()),
    'yyyy-MM-dd HH:mm:ss',
  );

  const postNumber = number ? ` (#${number})` : null;

  return (
    <ConfigProvider direction={postDirection}>
      <li className="post">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Link to={`/address/${data.address}`}>{data.address} </Link> by{' '}
            <a
              style={{ fontWeight: 500 }}
              href={`https://bitcointalk.org/index.php?action=profile;u=${data.author_uid}`}
            >
              {data.author}
            </a>{' '}
            on <Text strong>{formattedDate} UTC </Text>
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

export default CompactAddressCard;
