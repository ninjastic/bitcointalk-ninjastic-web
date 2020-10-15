import React, { useEffect, useState } from 'react';
import { useHistory, useRouteMatch, Link } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from 'react-query';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Divider,
  Table,
  Image,
  Collapse,
  Button,
  Radio,
  Tabs,
} from 'antd';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { sub, addMinutes, startOfDay, endOfDay } from 'date-fns';
import { useMediaQuery } from 'react-responsive';

import { LoadingOutlined } from '@ant-design/icons';
import api from '../../services/api';

import Header from '../../components/Header';
import AddressCard from '../../components/AddressCard';
import PostCard from '../../components/PostCard';
import HeaderPostCard from '../../components/HeaderPostCard';
import CompactPostCard from '../../components/CompactPostCard';
import PostsLineChart from '../../components/PostsLineChart';
import PostsBarChart from '../../components/PostsBarChart';

import { PageContent } from './styles';

const { Text, Title } = Typography;

interface BoardsData {
  name: string;
  count: number;
}

interface MatchParams {
  username: string;
}

interface BoardsChartProps {
  data: BoardsData[];
  total: number;
  loading?: boolean;
}

const UserAvatar: React.FC<{ author_uid: number }> = ({ author_uid }) => {
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [imageType, setImageType] = useState('png');
  const [loading, setLoading] = useState(true);

  const onLoad = () => {
    setAvatarSuccess(true);
    setLoading(false);
  };

  const onError = () => {
    if (imageType === 'jpg') return;
    setImageType('jpg');
    setLoading(false);
  };

  return (
    <>
      {loading ? (
        <Image
          src="data:image/png;base64,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"
          alt="User avatar"
          style={{
            marginRight: 15,
          }}
        />
      ) : null}
      <Image
        src={`https://bitcointalk.org/useravatars/avatar_${author_uid}.${imageType}`}
        alt="User avatar"
        onLoad={onLoad}
        onError={onError}
        style={{
          marginRight: 15,
          display: avatarSuccess ? 'initial' : 'none',
        }}
        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAABQCAYAAADSm7GJAAAHJElEQVR4nO2dh07zOhiGzfrZW2yEgPu/KEBssffm6MmpKxOS1HbtxDZ5paq0SWzH77ftlIGdnZ1vESkGBgbE93e0w68FgzEPviW3N5wSjEbxahEOnBKMRsWuVakJaNQm2jV0fHpsAtASrEDH+qjnxED2L4JbH6qPGNzRL4JdD9pV4NUKnh2sTHQTkx2atsQicF2CTQZsMtkpRNZFiOWeugS3RYN4YKKMbRQdIUyUsSXYEG0enDh0tCckIWgJThzeCG5Sisv61hlTE+P22ac3gpuMysv6Ni1Fuu7fZ59laNREt9Up/6gk2DcBIebeJvcc5WKDihSWznyOMcrFBl00Ra5pvyH5wyZgTXBTNebUFuQlfI07uDy46kZ1JsGn0MVo7oMjuOpGfU2CLnG6/beVLA3UOUmuBaeovaZIH2yy87+EpoK3jOCqzl2R7zv6bVE8z8N1TXRThFVF+4OD6ay1yC2/+XvtSXBZQzGAcY6MjIiJiYnumNXxPz4+is/PzyRcVBknxgSbkJsXBjmRdQgIfQwNDYnNzU0xPj7+6xhjub+/F4eHh93PKcKYYNNJrvrcL76+vkpbgNyNjQ0xNjYm3t7exOvr64/jfD81NSVWV1fF8fFx6dh0tv2GbNW8Euwbs7OzGVF5MNlo7eTkpPj4+Mi09OnpqUsWgjEzM5MJwNzcXOaLEYIiIh8eHrrXliFklxU8wUXaAUHz8/NibW2tVMO4Bv96dHQknp+fM42W4O+7u7vsnTYguQi0QT8ICP46FjOuzpkzgn2ZqXybsh8CJ4AfhUA5+eo7mgcxMlpW24Lcm5ub7LzR0dFCd0IfWAFMOZrskuC6zLoVwS4H109bXIsmXl5ein///nW1Vj0ulKBqePj/28UCSP99fX1d2D/trK+vZwSHiKp5U7+3IrioYVuSqsp6OnVpzkXDtre3xcvLi9jb2+vePJrLMfwt6RIvKQSci3Cg4ZCNRqttisAWF2wVIUgfrEusSoD6PQRC7PLychZsQTTfyZwXk8z3EA/BZ2dnWZQdcuHDNiPxQnBd/kVqKeSguXxGG4muMa9oJcfwtfhqjnE+phoB4Lzp6eksEidVws9yPJRngG3mMW/9rAnW9QF1AOIgkneIIzKGKIiFOPwz2gqRBGQXFxeZ5nKcPJhrEIj9/f3SdMkHehFYFmBWIX882mJs0c1DKmYZDb29vc1SpKWlJbG7u5t9Tzok816p+ZxDtI1/5lzdpb5+haAuK9fXlp2QgPZibvGtaOHJyYlYWVnpkia1WZYmRWexgUIIPph3ric1ylfIXAaV/VzvJMiqkqyQS3KMDTMMaaQ+mOOFhYUssDo9Pc2+Ex1SVe3js8yX0W7SIv4WDQmx6zn+ocG90gMfP+/g6lo+42vRPggigII8TPXV1VUWcPEq61OSigWQKVMKv2Twg2C5nmizc7HOwERU+GAI5hipEN+plawqvL+//8iHU1ldsvLBrnySi2uKCOdv/DAvChq6D53VUeCoG9GtJuUnXyUWf4uZRnsJsoiM0cx8blsErqNtgq2UtgtZ/U6WrYS70Iyiig7EQqRc8SEaxtxKcnXANbRF+ZLraLNqvTkW/NJg149YqlGhC81QzSjtUaSQf6OxskxJutNrHVd0tJ7omeAK7eWd4odcTYrdHzsx0XVWteSEQ54sNZIeyX7QOo5TmTo4OCjUYjleyIVEiiCikzItLi7+uB/ao8ypgxDTyEqCdQdc903JMqTobL3JA9L4fmtrS5yfn3cJyi9UoLkUQ9B8BEZdV5bA7MsadS+E6Lsrf/Hdtthd142qa78ScrsOm+0gGQ2UhQyiatERCgoanCc331GyxEQX3U9M22t/bXSM9Sf9ywRJ7rkin8XcYsbRUHm+mlZBOBUuNgyIkuJJ7BF1NASbTrYs2JAyYbJ5ySAMTcUco9X4aJ2dkz7H6hPR5ME2roKX3DIr91+p1Tq5qhQaXApIl+AkzFHBPeS107W2FqGJlaYyJPVDaL4EtO482GV/2r82m+qjHSp8r6LpzqFpIakK2hpcVuRPCb5dVB37xvNwtqNDl/Cq80ITGhfjafqetAnuNdAqSSra3mraRhNIYVWpliArpeU3UzR979Y+2AX+QuBmAh8pnHcNrtolYSM0rVCYobY82JUFSNnc6+yHU6Ej7N4JDuUxkDLEahF0x231f5NsEaL2+Sxi+H46UUd5rP5vkuuBp+BXfTz90G//wtRE6zy3WzfaoKsahU82FMHnalM/7f7lHFsHv55sKEOQ+40KlgJ1rkkBxkFWCmh6g2Ada80SjT7hXxdC2xAYopX7U//5zCUBsZj69l/bWcJWWEwFo19BiorgJrTGdZ+mgtHvTpuoCJb7muskOvQ0zNuOjqbgoyCfMoIm2PXjpibt+X5E1vY803EFTbCPJxN10E86pXud7Xmm42qj6AKE7HeNNFoI8R8Fd67ldZjDQQAAAABJRU5ErkJggg=="
      />
    </>
  );
};

const DeletedPosts: React.FC<{ username: string }> = ({ username }) => {
  const [postsViewType, setPostsViewType] = useState('normal');

  const {
    data,
    isLoading,
    fetchMore,
    isFetchingMore,
    canFetchMore,
    isError,
  } = useInfiniteQuery(
    `userDeletedPosts:${username}`,
    async (key, last = '') => {
      const { data: responseData } = await api.get(
        `posts/history?deleted=true&author=${username}&last=${last}`,
      );

      return responseData;
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      getFetchMore: lastGroup => {
        if (lastGroup.data.posts_history.length < 20) return false;

        return lastGroup.data.posts_history[
          lastGroup.data.posts_history.length - 1
        ].created_at;
      },
    },
  );

  if (isLoading) {
    return (
      <Collapse>
        <Collapse.Panel
          header={isLoading ? <LoadingOutlined /> : 'Deleted Posts'}
          disabled={isLoading}
          key={1}
        />
      </Collapse>
    );
  }

  if (isError) {
    return (
      <Collapse>
        <Collapse.Panel header="Deleted Posts" key={1}>
          <Text type="secondary">Something went wrong.</Text>
        </Collapse.Panel>
      </Collapse>
    );
  }

  const deletedPostsLength = data.reduce(
    (p, c) => p + c.data.posts_history.length,
    0,
  );

  if (deletedPostsLength === 0) {
    return (
      <Collapse>
        <Collapse.Panel header="Deleted Posts" key={1}>
          <Text type="secondary">
            No deleted posts were found in our database.
          </Text>
        </Collapse.Panel>
      </Collapse>
    );
  }

  return (
    <Collapse>
      <Collapse.Panel
        header={`Deleted Posts (${deletedPostsLength}${
          deletedPostsLength === 20 ? '+' : ''
        })`}
        key={1}
      >
        <div style={{ marginBottom: 15 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {data && !isLoading ? (
              <Text>
                <Text style={{ fontWeight: 500 }}>Results: </Text>
                <Text>{data[0].data.total_results}</Text>
              </Text>
            ) : null}
            <Radio.Group
              onChange={e => setPostsViewType(e.target.value)}
              value={postsViewType}
              defaultValue="normal"
            >
              <Radio.Button value="normal">Normal</Radio.Button>
              <Radio.Button value="header">Header Only</Radio.Button>
              <Radio.Button value="compact">Compact</Radio.Button>
            </Radio.Group>
          </div>
        </div>
        {data.map((group, groupIndex, array) => {
          if (!group.data.posts_history.length) {
            return (
              <div style={{ textAlign: 'center' }} key="NoResults">
                <Text type="secondary">No results.</Text>
              </div>
            );
          }

          return (
            <div key={groupIndex}>
              {group.data.posts_history.map((post, i) => {
                switch (postsViewType) {
                  case 'normal':
                    return (
                      <div style={{ marginBottom: 30 }} key={post.post_id}>
                        <PostCard
                          data={post}
                          number={groupIndex * 100 + i + 1}
                        />
                        <Divider />
                      </div>
                    );
                  case 'header':
                    return (
                      <div key={post.post_id}>
                        <HeaderPostCard
                          data={post}
                          number={groupIndex * 100 + i + 1}
                          style={{ marginBottom: 15 }}
                        />
                      </div>
                    );
                  case 'compact':
                    return (
                      <ul
                        key={post.post_id}
                        style={{ paddingInlineStart: 20, marginBottom: 0 }}
                      >
                        <CompactPostCard
                          data={post}
                          number={groupIndex * 100 + i + 1}
                        />
                      </ul>
                    );
                  default:
                    return null;
                }
              })}
              {groupIndex === array.length - 1 ? (
                <div style={{ marginTop: 15, textAlign: 'center' }}>
                  {canFetchMore ? (
                    <Button
                      size="large"
                      onClick={() => fetchMore()}
                      disabled={!!isFetchingMore}
                      style={{ width: 110 }}
                    >
                      {isFetchingMore ? <LoadingOutlined /> : 'Load more'}
                    </Button>
                  ) : (
                    <Text>You reached the end!</Text>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </Collapse.Panel>
    </Collapse>
  );
};

const EditedPosts: React.FC<{ username: string }> = ({ username }) => {
  const [postsViewType, setPostsViewType] = useState('normal');

  const {
    data,
    isLoading,
    fetchMore,
    isFetchingMore,
    canFetchMore,
    isError,
  } = useInfiniteQuery(
    `userEditedPosts:${username}`,
    async (key, last = '') => {
      const { data: responseData } = await api.get(
        `posts/history?deleted=false&author=${username}&last=${last}`,
      );

      return responseData;
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      getFetchMore: lastGroup => {
        if (lastGroup.data.posts_history.length < 20) return false;

        return lastGroup.data.posts_history[
          lastGroup.data.posts_history.length - 1
        ].created_at;
      },
    },
  );

  if (isLoading) {
    return (
      <Collapse>
        <Collapse.Panel
          header={isLoading ? <LoadingOutlined /> : 'Edited Posts'}
          disabled={isLoading}
          key={1}
        />
      </Collapse>
    );
  }

  if (isError) {
    return (
      <Collapse>
        <Collapse.Panel header="Edited Posts" key={1}>
          <Text type="secondary">Something went wrong.</Text>
        </Collapse.Panel>
      </Collapse>
    );
  }

  const editedPostsLength = data.reduce(
    (p, c) => p + c.data.posts_history.length,
    0,
  );

  if (editedPostsLength === 0) {
    return (
      <Collapse>
        <Collapse.Panel header="Edited Posts" key={1}>
          <Text type="secondary">
            No edited posts were found in our database.
          </Text>
        </Collapse.Panel>
      </Collapse>
    );
  }

  return (
    <Collapse>
      <Collapse.Panel
        header={`Edited Posts (${editedPostsLength}${
          editedPostsLength === 20 ? '+' : ''
        })`}
        key={1}
      >
        <div style={{ marginBottom: 15 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {data && !isLoading ? (
              <Text>
                <Text style={{ fontWeight: 500 }}>Results:</Text>
                <Text>{data[0].data.total_results}</Text>
              </Text>
            ) : null}
            <Radio.Group
              onChange={e => setPostsViewType(e.target.value)}
              value={postsViewType}
              defaultValue="normal"
            >
              <Radio.Button value="normal">Normal</Radio.Button>
              <Radio.Button value="header">Header Only</Radio.Button>
              <Radio.Button value="compact">Compact</Radio.Button>
            </Radio.Group>
          </div>
        </div>
        {data.map((group, groupIndex, array) => {
          if (!group.data.posts_history.length) {
            return (
              <div style={{ textAlign: 'center' }} key="NoResults">
                <Text type="secondary">No results.</Text>
              </div>
            );
          }

          return (
            <div key={groupIndex}>
              {group.data.posts_history.map((post, i) => {
                switch (postsViewType) {
                  case 'normal':
                    return (
                      <div style={{ marginBottom: 30 }} key={post.post_id}>
                        <PostCard
                          data={post}
                          number={groupIndex * 100 + i + 1}
                        />
                        <Divider />
                      </div>
                    );
                  case 'header':
                    return (
                      <div key={post.post_id}>
                        <HeaderPostCard
                          data={post}
                          number={groupIndex * 100 + i + 1}
                          style={{ marginBottom: 15 }}
                        />
                      </div>
                    );
                  case 'compact':
                    return (
                      <ul
                        key={post.post_id}
                        style={{ paddingInlineStart: 20, marginBottom: 0 }}
                      >
                        <CompactPostCard
                          data={post}
                          number={groupIndex * 100 + i + 1}
                        />
                      </ul>
                    );
                  default:
                    return null;
                }
              })}
              {groupIndex === array.length - 1 ? (
                <div style={{ marginTop: 15, textAlign: 'center' }}>
                  {canFetchMore ? (
                    <Button
                      size="large"
                      onClick={() => fetchMore()}
                      disabled={!!isFetchingMore}
                      style={{ width: 110 }}
                    >
                      {isFetchingMore ? <LoadingOutlined /> : 'Load more'}
                    </Button>
                  ) : (
                    <Text>You reached the end!</Text>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </Collapse.Panel>
    </Collapse>
  );
};

const FavoriteTopics: React.FC<{ username: string }> = ({ username }) => {
  const [period, setPeriod] = useState('all-time');

  const { data, isLoading, refetch, isFetching } = useQuery(
    `userTopTopics:${username}`,
    async () => {
      let from = '';
      let to = '';

      const dateUTC = addMinutes(new Date(), new Date().getTimezoneOffset());

      switch (period) {
        case 'all-time':
          from = '';
          to = '';
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

      const { data: responseData } = await api.get(
        `/users/${username}/topics`,
        { params: { from, to } },
      );

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  useEffect(() => {
    refetch();
  }, [period, refetch]);

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a href={`https://bitcointalk.org/index.php?topic=${record.topic_id}`}>
          {text}
        </a>
      ),
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
      render: text => (
        <Link to={`/search?author=${username}&topic_id=${text}`}>View</Link>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 10,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Radio.Group
          defaultValue="all-time"
          value={period}
          onChange={e => setPeriod(e.target.value)}
        >
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
  const {
    data,
    isLoading,
    fetchMore,
    isFetchingMore,
    canFetchMore,
    isError,
  } = useInfiniteQuery(
    `userAddresses:${username}`,
    async (key, last = '') => {
      const { data: responseData } = await api.get(
        `/users/${username}/addresses`,
        {
          params: {
            last,
            limit: 20,
          },
        },
      );

      return responseData;
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      getFetchMore: lastGroup => {
        if (lastGroup.data.length < 20) return false;

        const last = lastGroup.data[lastGroup.data.length - 1];
        return `${last.address},${last.created_at},${last.id}`;
      },
    },
  );

  if (isLoading) {
    return (
      <Collapse>
        <Collapse.Panel
          header={isLoading ? <LoadingOutlined /> : 'Mentioned Addresses'}
          disabled={isLoading}
          key={1}
        />
      </Collapse>
    );
  }

  if (isError) {
    return (
      <Collapse>
        <Collapse.Panel header="Mentioned Addresses" key={1}>
          <Text type="secondary">Something went wrong.</Text>
        </Collapse.Panel>
      </Collapse>
    );
  }

  if (data.reduce((p, c) => p + c.data.length, 0) === 0) {
    return (
      <Collapse>
        <Collapse.Panel header="Mentioned Addresses" key={1}>
          <Text type="secondary">No addresses were found in our database.</Text>
        </Collapse.Panel>
      </Collapse>
    );
  }

  const uniqueUsers = [];
  let addressesLength = 0;

  data.forEach(group => {
    group.data.forEach(address => {
      addressesLength += 1;

      address.authors.forEach(author => {
        const exists = uniqueUsers.find(user => user === author);

        if (!exists) {
          uniqueUsers.push(author);
        }
      });
    });
  });

  return (
    <Collapse>
      <Collapse.Panel
        header={`Mentioned Addresses (${addressesLength}${
          addressesLength === 20 ? '+' : ''
        })`}
        key={1}
      >
        {data.map((group, groupIndex, array) => {
          return (
            <div key={groupIndex}>
              {group.data.map((address, i) => {
                return (
                  <AddressCard
                    data={address}
                    number={groupIndex * 20 + i + 1}
                    key={address.id}
                  />
                );
              })}
              {groupIndex === array.length - 1 ? (
                <div style={{ marginTop: 15, textAlign: 'center' }}>
                  {canFetchMore ? (
                    <Button
                      size="large"
                      onClick={() => fetchMore()}
                      disabled={!!isFetchingMore}
                      style={{ width: 110 }}
                    >
                      {isFetchingMore ? <LoadingOutlined /> : 'Load more'}
                    </Button>
                  ) : (
                    <Text>You reached the end!</Text>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </Collapse.Panel>
    </Collapse>
  );
};

const PostsWeekChart: React.FC<{ username: string }> = ({ username }) => {
  const { data, isLoading } = useQuery(
    `user:${username}:posts:week`,
    async () => {
      const { data: responseData } = await api.get(`/users/${username}/posts`);

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  return (
    <PostsLineChart
      data={data?.data}
      loading={isLoading}
      dateFormat="MM/dd"
      size="small"
    />
  );
};

const PostsMonthChart: React.FC<{ username: string }> = ({ username }) => {
  const { data, isLoading } = useQuery(
    `userPostsMonth:${username}`,
    async () => {
      const oneMonthAgo = sub(new Date(), { months: 1 }).toISOString();

      const { data: responseData } = await api.get(`/users/${username}/posts`, {
        params: {
          from: oneMonthAgo,
        },
      });

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  return (
    <PostsLineChart
      data={data?.data}
      loading={isLoading}
      dateFormat="MM/dd"
      size="small"
    />
  );
};

const PostsYearChart: React.FC<{ username: string }> = ({ username }) => {
  const { data, isLoading } = useQuery(
    `userPostsYear:${username}`,
    async () => {
      const oneYearAgo = sub(new Date(), { years: 1 }).toISOString();

      const { data: responseData } = await api.get(`/users/${username}/posts`, {
        params: {
          from: oneYearAgo,
          interval: '7d',
        },
      });

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  return (
    <PostsBarChart data={data?.data} loading={isLoading} dateFormat="MM/dd" />
  );
};

const BoardsChart: React.FC<BoardsChartProps> = ({ data, total, loading }) => {
  const COLORS = [
    { start: '#ED213A', end: '#93291E' },
    { start: '#525252', end: '#3d72b4' },
    { start: '#00B4DB', end: '#0083B0' },
    { start: '#ffb347', end: '#ffcc33' },
    { start: '#CB356B', end: '#BD3F32' },
    { start: '#fd746c', end: '#ff9068' },
    { start: '#f46b45', end: '#eea849' },
    { start: '#11998e', end: '#38ef7d' },
    { start: '#396afc', end: '#2948ff' },
    { start: '#F2F2F2', end: '#DBDBDB' },
  ];

  if (loading) {
    return (
      <div style={{ height: 100, textAlign: 'center', marginTop: 50 }}>
        <LoadingOutlined style={{ fontSize: 36 }} />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div style={{ height: 100, textAlign: 'center', marginTop: 30 }}>
        <Text type="secondary">No data</Text>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" aspect={2 / 1.3}>
      <PieChart margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
        <defs>
          {data.map((_, index) => (
            <linearGradient id={`myGradient${index}`} key={index}>
              <stop
                offset="0%"
                stopColor={COLORS[index % COLORS.length].start}
              />
              <stop
                offset="100%"
                stopColor={COLORS[index % COLORS.length].end}
              />
            </linearGradient>
          ))}
        </defs>
        <Pie
          isAnimationActive={false}
          data={data}
          startAngle={360}
          endAngle={0}
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="count"
          nameKey="name"
          label={entry => entry.name}
        >
          {data.map((board, index) => (
            <Cell
              key={`cell-${board.name}`}
              fill={`url(#myGradient${index})`}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={value => {
            return <span>{((Number(value) / total) * 100).toFixed(0)}%</span>;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

const BoardsTable: React.FC<{ data: any; loading: boolean }> = ({
  data,
  loading,
}) => {
  const tableData = data
    ? data.boards.map(board => ({
        ...board,
        percentage: `${(
          (Number(board.count) / data.total_results_with_board) *
          100
        ).toFixed(0)}%`,
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

  const { data, refetch, isLoading, isFetching } = useQuery(
    `userBoards:${username}`,
    async () => {
      let from = '';
      let to = '';

      const dateUTC = addMinutes(new Date(), new Date().getTimezoneOffset());

      switch (period) {
        case 'all-time':
          from = '';
          to = '';
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

      const { data: responseData } = await api.get(
        `/users/${username}/boards`,
        { params: { from, to } },
      );

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  useEffect(() => {
    refetch();
  }, [period, refetch]);

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
        <Text style={{ fontSize: 24, fontWeight: 500 }}>Boards Activity</Text>
        <Radio.Group
          defaultValue="all-time"
          value={period}
          onChange={e => setPeriod(e.target.value)}
        >
          <Radio.Button value="all-time">All time</Radio.Button>
          <Radio.Button value="30-days">30 days</Radio.Button>
          <Radio.Button value="7-days">7 days</Radio.Button>
        </Radio.Group>
      </Col>
      <Col xs={24} lg={12}>
        <BoardsChart
          data={data?.data?.boards}
          total={data?.data?.total_results_with_board}
          loading={isLoading || isFetching}
        />
      </Col>
      <Col xs={24} lg={12}>
        <BoardsTable data={data?.data} loading={isLoading || isFetching} />
      </Col>
    </>
  );
};

const User: React.FC = () => {
  const { username } = useRouteMatch().params as MatchParams;
  const history = useHistory();

  const isSmallScreen = useMediaQuery({ query: '(max-width: 767px)' });

  const { data, isLoading, isError } = useQuery(
    `user:${username}`,
    async () => {
      const { data: responseData } = await api.get(`/users/${username}`);

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  return (
    <div>
      <Header />
      {isLoading || isError || !data.data ? (
        <div style={{ width: '100%', marginTop: 30, textAlign: 'center' }}>
          {!isLoading && data?.result === 404 ? (
            <Text>This user could not be found in our database.</Text>
          ) : null}
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
                  <Button
                    onClick={() => history.push(`/search?author=${username}`)}
                  >
                    Search Posts
                  </Button>
                )}
              />
            </Col>
          </Row>
          <Divider />
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
            <Col span={24}>
              <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Favorite Topics" key="1">
                  <FavoriteTopics username={data.data.author} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Mentioned Addresses" key="2">
                  <MentionedAddresses username={data.data.author} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Deleted Posts" key="3">
                  <DeletedPosts username={data.data.author} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Edited Posts" key="4">
                  <EditedPosts username={data.data.author} />
                </Tabs.TabPane>
              </Tabs>
            </Col>
          </Row>
        </PageContent>
      )}
    </div>
  );
};

export default User;
