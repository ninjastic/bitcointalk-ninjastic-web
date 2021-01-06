import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Typography, Input, Checkbox } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import api from '../../services/api';

const { Text, Title } = Typography;

interface Props {
  address: string;
}

const AddressAuthorsCard: React.FC<Props> = ({ address }) => {
  const [showBBCode, setShowBBCode] = useState(false);
  const [showCount, setShowCount] = useState(false);

  const { data, isLoading, isError } = useQuery(
    `addressesAuthors:${address}`,
    async () => {
      const { data: responseData } = await api.get(`addresses/authors`, {
        params: {
          address,
        },
      });

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  if (isLoading) {
    return <LoadingOutlined />;
  }

  if (isError) {
    return <Text type="secondary">Something went wrong</Text>;
  }

  const authorsText = data?.data.authors?.reduce((prev, curr, i, array) => {
    if (showBBCode) {
      const forumProfileURL = '/index.php?action=profile;u=';

      let text = '';
      text += `${prev}`;
      text += `[url=${forumProfileURL}${curr.author_uid}]${curr.author}[/url]`;
      text += showCount ? ` ${curr.count})` : '';
      text += i !== array.length - 1 ? '\n' : '';

      return text;
    }

    return `${prev}${curr.author}${showCount ? ` (${curr.count})` : ''}${i !== array.length - 1 ? '\n' : ''}`;
  }, '');

  return (
    <div>
      <Title level={3}>List of users ({data?.data.authors?.length || '0'})</Title>
      <Checkbox onChange={e => setShowCount(e.target.checked)} style={{ marginBottom: 10 }}>
        Include count
      </Checkbox>
      <Checkbox onChange={e => setShowBBCode(e.target.checked)} style={{ marginBottom: 10 }}>
        BBCode
      </Checkbox>
      <Input.TextArea value={authorsText} contentEditable={false} autoSize={{ minRows: 3, maxRows: 10 }} />
    </div>
  );
};

export default AddressAuthorsCard;
