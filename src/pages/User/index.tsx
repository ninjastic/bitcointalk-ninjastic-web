import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useRouteMatch, Link } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from 'react-query';
import { Card, Row, Col, Statistic, Typography, Divider, Table, Image, Button, Radio, Tabs, Select } from 'antd';
import { sub, addMinutes, startOfDay, endOfDay, format, startOfWeek } from 'date-fns';
import { useMediaQuery } from 'react-responsive';
import { LoadingOutlined } from '@ant-design/icons';
import queryString from 'query-string';

import api from '../../services/api';

import Header from '../../components/Header';
// import PostCard from '../../components/PostCard';
// import HeaderPostCard from '../../components/HeaderPostCard';
// import CompactPostCard from '../../components/CompactPostCard';
import LineChart from '../../components/LineChart';
import BarChart from '../../components/BarChart';
import BoardsPieChart from '../../components/BoardsPieChart';
// import TreeMap from '../../components/TreeMap';
import AddressAggregatorCard from '../../components/AddressAggregatorCard/indes';

import { PageContent } from './styles';

const { Text, Title } = Typography;

interface MatchParams {
  username?: string;
  author_uid?: number;
}

const UserAvatar: React.FC<{ author_uid: number }> = ({ author_uid }) => {
  const [avatarSuccess, setAvatarSuccess] = useState(false);

  const onLoad = () => {
    setAvatarSuccess(true);
  };

  return (
    <Image
      src={`https://bitcointalk.org/useravatars/avatar_${author_uid}.jpg`}
      alt="User avatar"
      onLoad={onLoad}
      style={{
        marginRight: 15,
        display: avatarSuccess ? 'initial' : 'none',
      }}
      fallback={`https://bitcointalk.org/useravatars/avatar_${author_uid}.png`}
    />
  );
};

// const DeletedPosts: React.FC<{ username: string }> = ({ username }) => {
//   const [postsViewType, setPostsViewType] = useState('normal');

//   const { data, isLoading, fetchMore, isFetchingMore, canFetchMore, isError } = useInfiniteQuery(
//     `userDeletedPosts:${username}`,
//     async (key, last = null) => {
//       const { data: responseData } = await api.get('posts/history', {
//         params: {
//           deleted: true,
//           author: username,
//           last,
//         },
//       });

//       return responseData;
//     },
//     {
//       retry: false,
//       refetchOnWindowFocus: false,
//       refetchOnMount: false,
//       getFetchMore: lastGroup => {
//         if (lastGroup.data.posts_history.length < 20) return false;

//         return lastGroup.data.posts_history[lastGroup.data.posts_history.length - 1].created_at;
//       },
//     },
//   );

//   if (isLoading) {
//     return (
//       <Card title="Deleted Posts">
//         <LoadingOutlined />
//       </Card>
//     );
//   }

//   if (isError) {
//     return (
//       <Card title="Deleted Posts">
//         <Text type="secondary">Something went wrong...</Text>
//       </Card>
//     );
//   }

//   if (!data[0].data.total_results) {
//     return (
//       <Card title={`Deleted Posts (${data[0].data.total_results})`}>
//         <Text type="secondary">No results...</Text>
//       </Card>
//     );
//   }

//   return (
//     <Card title={`Deleted Posts (${data[0].data.total_results})`}>
//       <div style={{ marginBottom: 15 }}>
//         <div
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//           }}
//         >
//           {data && !isLoading ? (
//             <Text>
//               <Text style={{ fontWeight: 500 }}>Results: </Text>
//               <Text>{data[0].data.total_results}</Text>
//             </Text>
//           ) : null}
//           <Radio.Group onChange={e => setPostsViewType(e.target.value)} value={postsViewType} defaultValue="normal">
//             <Radio.Button value="normal">Normal</Radio.Button>
//             <Radio.Button value="header">Header Only</Radio.Button>
//             <Radio.Button value="compact">Compact</Radio.Button>
//           </Radio.Group>
//         </div>
//       </div>
//       {data.map((group, groupIndex, array) => {
//         if (!group.data.posts_history.length) {
//           return (
//             <div style={{ textAlign: 'center' }} key="NoResults">
//               <Text type="secondary">No results.</Text>
//             </div>
//           );
//         }

//         return (
//           <div key={groupIndex}>
//             {group.data.posts_history.map((post, i) => {
//               switch (postsViewType) {
//                 case 'normal':
//                   return (
//                     <div style={{ marginBottom: 30 }} key={post.post_id}>
//                       <PostCard data={post} number={groupIndex * 100 + i + 1} />
//                       <Divider />
//                     </div>
//                   );
//                 case 'header':
//                   return (
//                     <div key={post.post_id}>
//                       <HeaderPostCard data={post} number={groupIndex * 100 + i + 1} style={{ marginBottom: 15 }} />
//                     </div>
//                   );
//                 case 'compact':
//                   return (
//                     <ul key={post.post_id} style={{ paddingInlineStart: 20, marginBottom: 0 }}>
//                       <CompactPostCard data={post} number={groupIndex * 100 + i + 1} />
//                     </ul>
//                   );
//                 default:
//                   return null;
//               }
//             })}
//             {groupIndex === array.length - 1 ? (
//               <div style={{ marginTop: 15, textAlign: 'center' }}>
//                 {canFetchMore ? (
//                   <Button size="large" onClick={() => fetchMore()} disabled={!!isFetchingMore} style={{ width: 110 }}>
//                     {isFetchingMore ? <LoadingOutlined /> : 'Load more'}
//                   </Button>
//                 ) : (
//                   <Text type="secondary">You reached the end!</Text>
//                 )}
//               </div>
//             ) : null}
//           </div>
//         );
//       })}
//     </Card>
//   );
// };

// const EditedPosts: React.FC<{ username: string }> = ({ username }) => {
//   const [postsViewType, setPostsViewType] = useState('normal');

//   const { data, isLoading, fetchMore, isFetchingMore, canFetchMore, isError } = useInfiniteQuery(
//     `userEditedPosts:${username}`,
//     async (key, last = null) => {
//       const { data: responseData } = await api.get(`posts/history`, {
//         params: {
//           deleted: false,
//           author: username,
//           last,
//         },
//       });

//       return responseData;
//     },
//     {
//       retry: false,
//       refetchOnWindowFocus: false,
//       refetchOnMount: false,
//       getFetchMore: lastGroup => {
//         if (lastGroup.data.posts_history.length < 20) return false;

//         return lastGroup.data.posts_history[lastGroup.data.posts_history.length - 1].created_at;
//       },
//     },
//   );

//   if (isLoading) {
//     return (
//       <Card title="Edited Posts">
//         <LoadingOutlined />
//       </Card>
//     );
//   }

//   if (isError) {
//     return (
//       <Card title="Edited Posts">
//         <Text type="secondary">Something went wrong...</Text>
//       </Card>
//     );
//   }

//   if (!data[0].data.total_results) {
//     return (
//       <Card title="Edited Posts">
//         <Text type="secondary">No results...</Text>
//       </Card>
//     );
//   }

//   return (
//     <Card title={`Edited Posts (${data[0].data.total_results})`}>
//       <div style={{ marginBottom: 15 }}>
//         <div
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//           }}
//         >
//           {data && !isLoading ? (
//             <Text>
//               <Text strong>Results: </Text>
//               <Text>{data[0].data.total_results}</Text>
//             </Text>
//           ) : null}
//           <Radio.Group onChange={e => setPostsViewType(e.target.value)} value={postsViewType} defaultValue="normal">
//             <Radio.Button value="normal">Normal</Radio.Button>
//             <Radio.Button value="header">Header Only</Radio.Button>
//             <Radio.Button value="compact">Compact</Radio.Button>
//           </Radio.Group>
//         </div>
//       </div>
//       {data.map((group, groupIndex, array) => {
//         if (!group.data.posts_history.length) {
//           return (
//             <div style={{ textAlign: 'center' }} key="NoResults">
//               <Text type="secondary">No results.</Text>
//             </div>
//           );
//         }

//         return (
//           <div key={groupIndex}>
//             {group.data.posts_history.map((post, i) => {
//               switch (postsViewType) {
//                 case 'normal':
//                   return (
//                     <div style={{ marginBottom: 30 }} key={post.post_id}>
//                       <PostCard data={post} number={groupIndex * 100 + i + 1} />
//                       <Divider />
//                     </div>
//                   );
//                 case 'header':
//                   return (
//                     <div key={post.post_id}>
//                       <HeaderPostCard data={post} number={groupIndex * 100 + i + 1} style={{ marginBottom: 15 }} />
//                     </div>
//                   );
//                 case 'compact':
//                   return (
//                     <ul key={post.post_id} style={{ paddingInlineStart: 20, marginBottom: 0 }}>
//                       <CompactPostCard data={post} number={groupIndex * 100 + i + 1} />
//                     </ul>
//                   );
//                 default:
//                   return null;
//               }
//             })}
//             {groupIndex === array.length - 1 ? (
//               <div style={{ marginTop: 15, textAlign: 'center' }}>
//                 {canFetchMore ? (
//                   <Button size="large" onClick={() => fetchMore()} disabled={!!isFetchingMore} style={{ width: 110 }}>
//                     {isFetchingMore ? <LoadingOutlined /> : 'Load more'}
//                   </Button>
//                 ) : (
//                   <Text type="secondary">You reached the end!</Text>
//                 )}
//               </div>
//             ) : null}
//           </div>
//         );
//       })}
//     </Card>
//   );
// };

const FavoriteTopics: React.FC<{ username: string }> = ({ username }) => {
  const [period, setPeriod] = useState('all-time');

  const getDatePeriod = datePeriod => {
    let from = null;
    let to = null;

    const dateUTC = addMinutes(new Date(), new Date().getTimezoneOffset());

    switch (datePeriod) {
      case 'all-time':
        from = null;
        to = null;
        break;
      case '30-days':
        from = sub(startOfDay(dateUTC), { months: 1 }).toISOString();
        to = endOfDay(dateUTC).toISOString();
        break;
      case '7-days':
        from = sub(startOfDay(dateUTC), { weeks: 1 }).toISOString();
        to = endOfDay(dateUTC).toISOString();
        break;
      default:
        break;
    }

    return [from, to];
  };

  const { data, isLoading, refetch, isFetching } = useQuery(
    `userTopTopics:${username}`,
    async () => {
      const [from, to] = getDatePeriod(period);

      const { data: responseData } = await api.get(`/users/${username}/topics`, {
        params: {
          from,
          to,
          limit: 10,
        },
      });

      return responseData;
    },
    { refetchOnWindowFocus: false, refetchOnMount: false },
  );

  useEffect(() => {
    refetch();
  }, [period, refetch]);

  const [from, to] = getDatePeriod(period);

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => <a href={`https://bitcointalk.org/index.php?topic=${record.topic_id}`}>{text}</a>,
    },
    {
      title: 'Posts',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'View Posts',
      dataIndex: 'topic_id',
      key: 'view-posts',
      width: 130,
      render: (_, record) => {
        const queryStringified = queryString.stringify(
          {
            author: username,
            topic_id: record.topic_id,
            after_date: from,
            before_date: to,
          },
          { skipEmptyString: true, skipNull: true },
        );

        return <Link to={`/search?${queryStringified}`}>View</Link>;
      },
    },
    {
      title: 'View Topic Stats',
      dataIndex: 'topic_id',
      key: 'view-posts',
      width: 130,
      render: (_, record) => {
        return <Link to={`/topic/${record.topic_id}`}>View</Link>;
      },
    },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 10,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Title level={3}>Favorite Topics</Title>
        <Radio.Group defaultValue="all-time" value={period} onChange={e => setPeriod(e.target.value)}>
          <Radio.Button value="all-time">All time</Radio.Button>
          <Radio.Button value="30-days">30 days</Radio.Button>
          <Radio.Button value="7-days">7 days</Radio.Button>
        </Radio.Group>
      </div>
      <Table
        size="small"
        dataSource={data?.data}
        columns={columns}
        bordered
        rowKey="topic_id"
        loading={isLoading || isFetching}
        pagination={false}
      />
    </div>
  );
};

const MentionedAddresses: React.FC<{ username: string }> = ({ username }) => {
  interface Address {
    address: string;
    coin: 'BTC' | 'ETH';
    count: number;
  }

  interface Data {
    after_key: string;
    addresses: Address[];
  }

  interface Response {
    data: Data;
  }

  const { data, isLoading, fetchMore, isFetchingMore, canFetchMore, isError } = useInfiniteQuery<Response>(
    `userAddresses:${username}`,
    async (key, last = null) => {
      const { data: responseData } = await api.get(`/addresses/unique`, {
        params: {
          author: username,
          last,
          limit: 20,
        },
      });

      return responseData;
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      getFetchMore: lastGroup => {
        if (!lastGroup.data.after_key) return false;

        return lastGroup.data.after_key;
      },
    },
  );

  if (isLoading) {
    return <LoadingOutlined />;
  }

  if (isError) {
    return <Text type="secondary">Something went wrong...</Text>;
  }

  if (!data?.length) {
    return <Text type="secondary">No results...</Text>;
  }

  return (
    <div>
      {data.map((group, groupIndex, array) => {
        return (
          <div key={groupIndex}>
            {group.data.addresses.map(address => {
              return (
                <AddressAggregatorCard
                  key={address.address}
                  address={address.address}
                  coin={address.coin}
                  count={address.count}
                  author={username}
                />
              );
            })}
            {groupIndex === array.length - 1 ? (
              <div style={{ marginTop: 15, textAlign: 'center' }}>
                {canFetchMore ? (
                  <Button size="large" onClick={() => fetchMore()} disabled={!!isFetchingMore} style={{ width: 110 }}>
                    {isFetchingMore ? <LoadingOutlined /> : 'Load more'}
                  </Button>
                ) : (
                  <Text type="secondary">You reached the end!</Text>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

const FavoriteAddresses: React.FC<{ username: string }> = ({ username }) => {
  const { data, isLoading, isError } = useQuery(
    `favoriteAddresses:${username}`,
    async () => {
      const { data: responseData } = await api.get(`/addresses/unique/top`, {
        params: {
          author: username,
          limit: 5,
        },
      });

      return responseData;
    },
    { refetchOnMount: false, refetchOnWindowFocus: false },
  );

  if (isLoading) {
    return <LoadingOutlined />;
  }

  if (isError) {
    return <Text type="secondary">Something went wrong...</Text>;
  }

  if (!data?.data?.addresses?.length) {
    return <Text type="secondary">No results...</Text>;
  }

  return (
    <div>
      {data.data.addresses.map(address => {
        return (
          <AddressAggregatorCard
            address={address.address}
            coin={address.coin}
            key={address.address}
            count={address.count}
            author={username}
          />
        );
      })}
    </div>
  );
};

const PostsWeekChart: React.FC<{ username: string }> = ({ username }) => {
  const { data, isLoading, isError } = useQuery(
    `user:${username}:posts:week`,
    async () => {
      const { data: responseData } = await api.get(`/users/${username}/posts`);

      return responseData;
    },
    { refetchOnWindowFocus: false, refetchOnMount: false },
  );

  if (isError) {
    return <Text>Something went wrong</Text>;
  }

  return <LineChart data={data?.data} loading={isLoading} name="Posts" dateFormat="dd MMM yyyy" />;
};

const PostsMonthChart: React.FC<{ username: string }> = ({ username }) => {
  const { data, isLoading, isError } = useQuery(
    `userPostsMonth:${username}`,
    async () => {
      const fromDate = format(sub(new Date(), { months: 1 }), "yyyy-MM-dd'T'HH:mm:ss");

      const { data: responseData } = await api.get(`/users/${username}/posts`, {
        params: {
          from: fromDate,
        },
      });

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  if (isError) {
    return <Text>Something went wrong</Text>;
  }

  return <LineChart data={data?.data} loading={isLoading} name="Posts" dateFormat="dd MMM yyyy" />;
};

const PostsYearChart: React.FC<{ username: string }> = ({ username }) => {
  const { data, isLoading, isError } = useQuery(
    `userPostsYear:${username}`,
    async () => {
      const fromDate = format(sub(startOfWeek(new Date()), { years: 1 }), "yyyy-MM-dd'T'HH:mm:ss");

      const { data: responseData } = await api.get(`/users/${username}/posts`, {
        params: {
          from: fromDate,
          interval: '1w',
        },
      });

      return responseData;
    },
    { refetchOnWindowFocus: false, refetchOnMount: false },
  );

  if (isError) {
    return <Text>Something went wrong</Text>;
  }

  const dataNormalized =
    data?.data?.map(d => {
      return {
        y: d.doc_count,
        x: d.key,
      };
    }) || [];

  dataNormalized.shift();

  return <BarChart data={dataNormalized} loading={isLoading} name="Posts" dateFormat="dd MMM yyyy" />;
};

const MeritsLineChart: React.FC<{ username: string; type: string }> = ({ username, type }) => {
  const { data, isLoading, isError } = useQuery(
    `userMerits:${username}:${type}`,
    async () => {
      const fromDate = format(sub(new Date(), { months: 3 }), "yyyy-MM-dd'T'HH:mm:ss");

      const { data: responseDate } = await api.get(`/users/${username}/merits`, {
        params: {
          from: fromDate,
          type,
          interval: '1d',
        },
      });

      return responseDate;
    },
    { refetchOnWindowFocus: false, refetchOnMount: false },
  );

  if (isError) {
    return <Text>Something went wrong</Text>;
  }

  const dataNormalized = data?.data?.dates.map(d => {
    return {
      y: d.total_sum,
      x: d.key,
    };
  });

  return <BarChart data={dataNormalized} loading={isLoading} name="Merits" dateFormat="dd MMM yyyy" />;
};

const MeritsTable: React.FC<{ username: string; type: string }> = ({ username, type }) => {
  const { data, isLoading } = useQuery(
    `userMeritsTable:${username}:${type}`,
    async () => {
      const { data: responseData } = await api.get('/merits', {
        params: {
          [type]: username,
          limit: 150,
        },
      });

      return responseData;
    },
    { refetchOnWindowFocus: false, refetchOnMount: false },
  );

  const columns = [
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: type === 'receiver' ? 'From' : 'To',
      dataIndex: 'receiver',
      key: 'receiver',
      render: (text, record) => {
        const counterparty = username.toLowerCase() === text.toLowerCase() ? record.sender : record.receiver;
        return <Link to={`/user/${counterparty}`}>{counterparty}</Link>;
      },
    },
    {
      title: 'Post',
      dataIndex: 'post_id',
      key: 'post_id',
      render: (text, record) => {
        return <Link to={`/post/${text}`}>{record.title}</Link>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: text => <Text>{format(new Date(text), 'dd/MM/yyyy HH:mm:ss')}</Text>,
    },
  ];

  return (
    <Table bordered size="small" columns={columns} loading={isLoading} dataSource={data?.data.merits} rowKey="id" />
  );
};

const MeritFriendsTable: React.FC<{ username: string }> = ({ username }) => {
  const { data, isLoading } = useQuery(
    `userMeritsFriends:${username}`,
    async () => {
      const fromDate = format(sub(new Date(), { months: 3 }), "yyyy-MM-dd'T'HH:mm:ss");

      const { data: responseData } = await api.get('/merits/fans', {
        params: {
          receiver: username,
          after_date: fromDate,
          limit: 5,
        },
      });

      return responseData;
    },
    { refetchOnWindowFocus: false, refetchOnMount: false },
  );

  const columns = [
    {
      title: '#',
      dataIndex: 'number',
      key: 'number',
      width: 50,
      render: (_, r, i) => {
        return <Text>{i + 1}</Text>;
      },
    },
    {
      title: 'Username',
      dataIndex: 'key',
      key: 'key',
      render: text => {
        return <Link to={`/user/${text}`}>{text}</Link>;
      },
    },
    {
      title: 'Amount',
      dataIndex: 'count',
      key: 'count',
    },
  ];

  return (
    <Table
      bordered
      size="small"
      columns={columns}
      loading={isLoading}
      dataSource={data?.data}
      pagination={false}
      rowKey="key"
    />
  );
};

const MeritBoardsTable: React.FC<{ username: string }> = ({ username }) => {
  const { data, isLoading } = useQuery(
    `userMeritsBoards:${username}`,
    async () => {
      const fromDate = format(sub(new Date(), { months: 3 }), "yyyy-MM-dd'T'HH:mm:ss");

      const { data: responseData } = await api.get('/merits/boards', {
        params: {
          receiver: username,
          after_date: fromDate,
          limit: 5,
        },
      });

      return responseData;
    },
    { refetchOnWindowFocus: false, refetchOnMount: false },
  );

  const columns = [
    {
      title: '#',
      dataIndex: 'number',
      key: 'number',
      width: 50,
      render: (_, r, i) => {
        return <Text>{i + 1}</Text>;
      },
    },
    {
      title: 'Board',
      dataIndex: 'board_id',
      key: 'board_id',
      render: (text, record) => {
        return <Link to={`https://bitcointalk.org/index.php?board=${text}`}>{record.board_name}</Link>;
      },
    },
    {
      title: 'Amount',
      dataIndex: 'count',
      key: 'count',
    },
  ];

  return (
    <Table
      bordered
      size="small"
      columns={columns}
      loading={isLoading}
      dataSource={data?.data}
      pagination={false}
      rowKey="key"
    />
  );
};

const BoardsTable: React.FC<{
  username: string;
  data: any;
  loading: boolean;
  from: string | null;
  to: string | null;
}> = ({ username, data, loading, from, to }) => {
  const tableData = data
    ? data.boards.map(board => ({
        ...board,
        percentage: `${Math.floor((Number(board.count) / data.total_results_with_board) * 100)}%`,
      }))
    : [];

  const columns = [
    {
      title: 'Board',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Posts',
      dataIndex: 'count',
      key: 'count',
      width: 50,
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 50,
    },
    {
      title: 'View Posts',
      dataIndex: 'view',
      key: 'view',
      width: 75,
      render: (text, record) => {
        const queryStringified = queryString.stringify(
          {
            author: username,
            board: record.key,
            after_date: from,
            before_date: to,
          },
          { skipEmptyString: true, skipNull: true },
        );

        return <Link to={`/search?${queryStringified}`}>View</Link>;
      },
    },
  ];

  return (
    <Table
      rowKey={record => record.name}
      columns={columns}
      dataSource={tableData}
      pagination={false}
      size="small"
      bordered
      loading={loading}
      locale={{ emptyText: 'No data...' }}
    />
  );
};

const BoardsActivityRow: React.FC<{ username: string }> = ({ username }) => {
  const [period, setPeriod] = useState('all-time');

  const getDatePeriod = datePeriod => {
    let from = null;
    let to = null;

    const date = new Date();

    switch (datePeriod) {
      case 'all-time':
        from = null;
        to = null;
        break;
      case '30-days':
        from = format(sub(startOfDay(date), { months: 1 }), "yyyy-MM-dd'T'HH:mm:ss");
        to = format(endOfDay(date), "yyyy-MM-dd'T'HH:mm:ss");
        break;
      case '7-days':
        from = format(sub(startOfDay(date), { weeks: 1 }), "yyyy-MM-dd'T'HH:mm:ss");
        to = format(endOfDay(date), "yyyy-MM-dd'T'HH:mm:ss");
        break;
      default:
        break;
    }

    return [from, to];
  };

  const { data, refetch, isLoading, isFetching } = useQuery(
    `userBoards:${username}`,
    async () => {
      const [from, to] = getDatePeriod(period);

      const { data: responseData } = await api.get(`/users/${username}/boards`, { params: { from, to } });

      return responseData;
    },
    { refetchOnWindowFocus: false, refetchOnMount: false },
  );

  useEffect(() => {
    refetch();
  }, [period, refetch]);

  const [from, to] = getDatePeriod(period);

  return (
    <>
      <Col
        span={24}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text strong style={{ fontSize: 24 }}>
          Boards Activity
        </Text>
        <Radio.Group defaultValue="all-time" value={period} onChange={e => setPeriod(e.target.value)}>
          <Radio.Button value="all-time">All time</Radio.Button>
          <Radio.Button value="30-days">30 days</Radio.Button>
          <Radio.Button value="7-days">7 days</Radio.Button>
        </Radio.Group>
      </Col>
      <Col xs={24} lg={12}>
        <BoardsPieChart data={data?.data?.boards} loading={isLoading || isFetching} />
      </Col>
      <Col xs={24} lg={12}>
        <BoardsTable username={username} data={data?.data} loading={isLoading || isFetching} from={from} to={to} />
      </Col>
    </>
  );
};

const User: React.FC = () => {
  const { username, author_uid } = useRouteMatch().params as MatchParams;

  const { search } = useLocation();
  const history = useHistory();

  const [userTab, setUserTab] = useState('');
  const [meritType, setMeritType] = useState('receiver');

  const isSmallScreen = useMediaQuery({ query: '(max-width: 767px)' });

  useEffect(() => {
    const query = queryString.parse(search);

    Object.keys(query).forEach(k => {
      if (k) {
        setUserTab(k);
      }
    });
  }, []);

  useEffect(() => {
    history.push(`?${userTab}`);
  }, [userTab]);

  const { data, isLoading, isError } = useQuery(
    `user:${username || author_uid}`,
    async () => {
      const { data: responseData } = await api.get(username ? `users/${username}` : `users/id/${author_uid}`);

      return responseData;
    },
    { refetchOnWindowFocus: false, refetchOnMount: false },
  );

  return (
    <div>
      <Header />
      {isLoading || isError || !data?.data ? (
        <div style={{ width: '100%', marginTop: 30, textAlign: 'center' }}>
          {!isLoading && !isError && !data?.data ? <Text>This user could not be found on our database.</Text> : null}
          {!isLoading && isError ? <Text>Something went wrong...</Text> : null}
          {isLoading ? <LoadingOutlined style={{ fontSize: 50 }} /> : null}
        </div>
      ) : (
        <PageContent>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={10} lg={10}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: isSmallScreen ? 'center' : 'initial',
                }}
              >
                <UserAvatar author_uid={data.data.author_uid} />
                <Card.Meta
                  title={
                    <div>
                      <Title level={3} style={{ margin: 0 }}>
                        {data.data.author}
                      </Title>
                      <Typography.Link
                        style={{ fontSize: 16 }}
                        href={`https://bitcointalk.org/index.php?action=profile;u=${data.data.author_uid}`}
                      >
                        {data.data.author_uid}
                      </Typography.Link>
                    </div>
                  }
                />
              </div>
            </Col>
            <Col xs={12} md={6} lg={6}>
              <Statistic
                title="Scraped Posts"
                value={data.data.posts_count}
                valueRender={value => {
                  return isLoading ? <LoadingOutlined /> : value;
                }}
              />
            </Col>
            <Col xs={12} md={6} lg={6}>
              <Statistic
                title="Links"
                value={null}
                valueRender={() => (
                  <Button onClick={() => history.push(`/search?author=${data.data?.author}`)}>Search Posts</Button>
                )}
              />
            </Col>
          </Row>
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Tabs defaultActiveKey={userTab} onChange={e => setUserTab(e)}>
                <Tabs.TabPane tab="Overview" key="">
                  <Row gutter={[24, 24]} align="stretch">
                    <BoardsActivityRow username={data.data.author} />
                  </Row>
                  <Divider />
                  <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12}>
                      <Title level={3}>Posts in the last 7 days</Title>
                      <PostsWeekChart username={data.data.author} />
                    </Col>
                    <Col xs={24} lg={12}>
                      <Title level={3}>Posts in the last month</Title>
                      <PostsMonthChart username={data.data.author} />
                    </Col>
                    <Divider />
                    <Col span={24}>
                      <Title level={3}>Posts per week (last year)</Title>
                      <PostsYearChart username={data.data.author} />
                    </Col>
                  </Row>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Merits" key="merits">
                  <Row gutter={[24, 24]}>
                    <Col span={24} lg={12}>
                      <Title level={3}>Merits received (last 3 months)</Title>
                      <MeritsLineChart username={data.data.author} type="receiver" />
                    </Col>
                    <Col span={24} lg={12}>
                      <Title level={3}>Merits sent (last 3 months)</Title>
                      <MeritsLineChart username={data.data.author} type="sender" />
                    </Col>
                    <Col span={24}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Title level={3}>Latest merit transactions</Title>
                        <Select
                          placeholder="Type"
                          defaultValue={meritType}
                          onChange={e => setMeritType(e)}
                          style={{ width: 200 }}
                        >
                          <Select.Option value="receiver">Received</Select.Option>
                          <Select.Option value="sender">Sent</Select.Option>
                        </Select>
                      </div>
                      <MeritsTable username={data.data.author} type={meritType} />
                    </Col>
                    <Col span={12}>
                      <Title level={3}>Top merit fans (last 3 months)</Title>
                      <MeritFriendsTable username={data.data.author} />
                    </Col>
                    <Col span={12}>
                      <Title level={3}>Top merited boards (last 3 months)</Title>
                      <MeritBoardsTable username={data.data.author} />
                    </Col>
                  </Row>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Topics" key="topics">
                  <FavoriteTopics username={data.data.author} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Addresses" key="addresses">
                  <Title level={5}>Top 5 Favorite Addresses</Title>
                  <FavoriteAddresses username={data.data.author} />
                  <Divider />
                  <Title level={5}>All Mentioned Addresses</Title>
                  <MentionedAddresses username={data.data.author} />
                </Tabs.TabPane>
                {/* <Tabs.TabPane tab="Deleted Posts" key="5">
                  <DeletedPosts username={data.data.author} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Edited Posts" key="6">
                  <EditedPosts username={data.data.author} />
                </Tabs.TabPane> */}
              </Tabs>
            </Col>
          </Row>
        </PageContent>
      )}
    </div>
  );
};

export default User;
