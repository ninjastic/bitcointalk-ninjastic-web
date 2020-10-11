import React from 'react';
import { useQuery } from 'react-query';
import { Card, Typography, Table } from 'antd';
import numeral from 'numeral';

import { Link } from 'react-router-dom';
import { LoadingOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Text } = Typography;

const TopicAuthorsCard: React.FC<{ topicId: number }> = ({ topicId }) => {
  const { isLoading, isError, data } = useQuery(
    `posts:topic:${topicId}:authors`,
    async () => {
      const { data: responseData } = await api.get(
        `/posts/topic/${topicId}/authors`,
      );

      return responseData;
    },
    {
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  if (isError) {
    return (
      <Card>
        <Text strong key={1}>
          Something went wrong...
        </Text>
      </Card>
    );
  }

  const tableData = data?.data.map(r => {
    return {
      key: r.author,
      author: r.author,
      author_uid: r.author_uid,
      count: r.count,
    };
  });

  const columns = [
    {
      title: '#',
      dataIndex: 'author',
      key: 'number',
      width: 25,
      render: (text, record, index) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      render: (text, record) => {
        return (
          <a
            href={`https://bitcointalk.org/index.php?action=profile;u=${record.author_uid}`}
          >
            {text}
          </a>
        );
      },
    },
    {
      title: 'Posts',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'User Stats',
      dataIndex: 'author',
      key: 'author',
      render: text => {
        return <Link to={`/user/${text}`}>View</Link>;
      },
    },
    {
      title: 'View Posts',
      dataIndex: 'author',
      key: 'author',
      render: text => {
        return (
          <Link to={`/search?author=${text}&topic_id=${topicId}`}>View</Link>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginTop: 5, marginBottom: 15 }}>
        <Text>
          <Text style={{ fontWeight: 500 }}>Users: </Text>
          <Text>
            {isLoading ? (
              <LoadingOutlined />
            ) : (
              numeral(data?.data.length || 0).format('0,0')
            )}
          </Text>
        </Text>
      </div>
      <Card title="Users participating on the topic">
        <Table
          dataSource={tableData}
          columns={columns}
          size="small"
          loading={isLoading}
          pagination={false}
          bordered
        />
      </Card>
    </div>
  );
};

export default TopicAuthorsCard;
