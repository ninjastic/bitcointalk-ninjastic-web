import React from 'react';
import { useQuery } from 'react-query';
import { Card } from 'antd';

import api from '../../services/api';

interface Props {
  address: string;
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

const AddressAuthorsCard: React.FC<Props> = ({ address }) => {
  const { data, isLoading, isError } = useQuery(
    `addressesAuthors:${address}`,
    async () => {
      const { data: responseData } = await api.get(
        `addresses/${address}/authors`,
      );

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  if (isLoading || isError) {
    return <></>;
  }

  return (
    <Card type="inner" title="Users">
      {data.map(entry => (
        <div key={entry.author}>
          <a
            href={`https://bitcointalk.org/index.php?action=profile;u=${entry.author_uid}`}
            style={{ color: `${textToColor(entry.author)}` }}
          >
            {entry.author} ({entry.posts_id.length})
          </a>
        </div>
      ))}
    </Card>
  );
};

export default AddressAuthorsCard;
