import React from 'react';
import { Collapse, Typography } from 'antd';
import { Link } from 'react-router-dom';
import parse from 'html-react-parser';
import DOMPurity from 'dompurify';
import { addMinutes, format } from 'date-fns';

import imageBTC from '../../assets/images/btc.png';
import imageETH from '../../assets/images/eth.png';
import imageTRX from '../../assets/images/trx.png';

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
  number: number;
  showAddress?: boolean;
}

const AddressCard: React.FC<Props> = ({ data, number, showAddress = true }) => {
  const icons = [
    {
      coin: 'ETH',
      image: imageETH,
    },
    {
      coin: 'BTC',
      image: imageBTC,
    },
    {
      coin: 'TRX',
      image: imageTRX,
    },
  ];

  const date = new Date(data.date);
  const formattedDate = format(addMinutes(date, date.getTimezoneOffset()), "yyyy-MM-dd HH:mm:ss 'UTC'");

  return (
    <Collapse>
      <Collapse.Panel
        key={`${data.address}_${data.post_id}`}
        header={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex' }}>
              {showAddress ? (
                <img
                  height={24}
                  width={24}
                  src={icons.find(i => i.coin === data.coin)?.image}
                  alt={data.coin}
                  style={{ marginRight: 5 }}
                />
              ) : null}
              <div>
                <div>
                  {showAddress ? (
                    <Link
                      to={`/address/${data.address}`}
                      style={{
                        fontWeight: 500,
                        fontSize: 16,
                        wordWrap: 'break-word',
                      }}
                    >
                      {data.address}
                    </Link>
                  ) : null}
                  <div>
                    <Text>by </Text>
                    <a href={`https://bitcointalk.org/index.php?action=profile;u=${data.author_uid}`}>{data.author}</a>
                    <Text> on </Text>
                    <Text strong>{formattedDate}</Text>
                    <div style={{ marginTop: 5 }}>
                      <a
                        href={`https://bitcointalk.org/index.php?topic=${data.topic_id}.msg${data.post_id}#msg${data.post_id}`}
                      >
                        {data.title.substring(0, 50)}
                        {data.title.length > 50 ? '...' : ''}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ textAlign: 'right' }}>
                <Link to={`/post/${data.post_id}`}>{data.post_id}</Link>{' '}
                <Text>
                  (#
                  {number})
                </Text>
                <div>
                  <Text>{data.board_name || '-'}</Text>
                </div>
              </div>
            </div>
          </div>
        }
      >
        {parse(DOMPurity.sanitize(data.content))}
      </Collapse.Panel>
    </Collapse>
  );
};

export default AddressCard;
