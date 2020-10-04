import React, { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
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
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  format,
  sub,
  isValid,
  addMinutes,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { useMediaQuery } from 'react-responsive';

import { LoadingOutlined } from '@ant-design/icons';
import api from '../../services/api';

import Header from '../../components/Header';
import AddressCard from '../../components/AddressCard';
import PostCard from '../../components/PostCard';

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
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAABQCAYAAADSm7GJAAAHJElEQVR4nO2dh07zOhiGzfrZW2yEgPu/KEBssffm6MmpKxOS1HbtxDZ5paq0SWzH77ftlIGdnZ1vESkGBgbE93e0w68FgzEPviW3N5wSjEbxahEOnBKMRsWuVakJaNQm2jV0fHpsAtASrEDH+qjnxED2L4JbH6qPGNzRL4JdD9pV4NUKnh2sTHQTkx2atsQicF2CTQZsMtkpRNZFiOWeugS3RYN4YKKMbRQdIUyUsSXYEG0enDh0tCckIWgJThzeCG5Sisv61hlTE+P22ac3gpuMysv6Ni1Fuu7fZ59laNREt9Up/6gk2DcBIebeJvcc5WKDihSWznyOMcrFBl00Ra5pvyH5wyZgTXBTNebUFuQlfI07uDy46kZ1JsGn0MVo7oMjuOpGfU2CLnG6/beVLA3UOUmuBaeovaZIH2yy87+EpoK3jOCqzl2R7zv6bVE8z8N1TXRThFVF+4OD6ay1yC2/+XvtSXBZQzGAcY6MjIiJiYnumNXxPz4+is/PzyRcVBknxgSbkJsXBjmRdQgIfQwNDYnNzU0xPj7+6xhjub+/F4eHh93PKcKYYNNJrvrcL76+vkpbgNyNjQ0xNjYm3t7exOvr64/jfD81NSVWV1fF8fFx6dh0tv2GbNW8Euwbs7OzGVF5MNlo7eTkpPj4+Mi09OnpqUsWgjEzM5MJwNzcXOaLEYIiIh8eHrrXliFklxU8wUXaAUHz8/NibW2tVMO4Bv96dHQknp+fM42W4O+7u7vsnTYguQi0QT8ICP46FjOuzpkzgn2ZqXybsh8CJ4AfhUA5+eo7mgcxMlpW24Lcm5ub7LzR0dFCd0IfWAFMOZrskuC6zLoVwS4H109bXIsmXl5ein///nW1Vj0ulKBqePj/28UCSP99fX1d2D/trK+vZwSHiKp5U7+3IrioYVuSqsp6OnVpzkXDtre3xcvLi9jb2+vePJrLMfwt6RIvKQSci3Cg4ZCNRqttisAWF2wVIUgfrEusSoD6PQRC7PLychZsQTTfyZwXk8z3EA/BZ2dnWZQdcuHDNiPxQnBd/kVqKeSguXxGG4muMa9oJcfwtfhqjnE+phoB4Lzp6eksEidVws9yPJRngG3mMW/9rAnW9QF1AOIgkneIIzKGKIiFOPwz2gqRBGQXFxeZ5nKcPJhrEIj9/f3SdMkHehFYFmBWIX882mJs0c1DKmYZDb29vc1SpKWlJbG7u5t9Tzok816p+ZxDtI1/5lzdpb5+haAuK9fXlp2QgPZibvGtaOHJyYlYWVnpkia1WZYmRWexgUIIPph3ric1ylfIXAaV/VzvJMiqkqyQS3KMDTMMaaQ+mOOFhYUssDo9Pc2+Ex1SVe3js8yX0W7SIv4WDQmx6zn+ocG90gMfP+/g6lo+42vRPggigII8TPXV1VUWcPEq61OSigWQKVMKv2Twg2C5nmizc7HOwERU+GAI5hipEN+plawqvL+//8iHU1ldsvLBrnySi2uKCOdv/DAvChq6D53VUeCoG9GtJuUnXyUWf4uZRnsJsoiM0cx8blsErqNtgq2UtgtZ/U6WrYS70Iyiig7EQqRc8SEaxtxKcnXANbRF+ZLraLNqvTkW/NJg149YqlGhC81QzSjtUaSQf6OxskxJutNrHVd0tJ7omeAK7eWd4odcTYrdHzsx0XVWteSEQ54sNZIeyX7QOo5TmTo4OCjUYjleyIVEiiCikzItLi7+uB/ao8ypgxDTyEqCdQdc903JMqTobL3JA9L4fmtrS5yfn3cJyi9UoLkUQ9B8BEZdV5bA7MsadS+E6Lsrf/Hdtthd142qa78ScrsOm+0gGQ2UhQyiatERCgoanCc331GyxEQX3U9M22t/bXSM9Sf9ywRJ7rkin8XcYsbRUHm+mlZBOBUuNgyIkuJJ7BF1NASbTrYs2JAyYbJ5ySAMTcUco9X4aJ2dkz7H6hPR5ME2roKX3DIr91+p1Tq5qhQaXApIl+AkzFHBPeS107W2FqGJlaYyJPVDaL4EtO482GV/2r82m+qjHSp8r6LpzqFpIakK2hpcVuRPCb5dVB37xvNwtqNDl/Cq80ITGhfjafqetAnuNdAqSSra3mraRhNIYVWpliArpeU3UzR979Y+2AX+QuBmAh8pnHcNrtolYSM0rVCYobY82JUFSNnc6+yHU6Ej7N4JDuUxkDLEahF0x231f5NsEaL2+Sxi+H46UUd5rP5vkuuBp+BXfTz90G//wtRE6zy3WzfaoKsahU82FMHnalM/7f7lHFsHv55sKEOQ+40KlgJ1rkkBxkFWCmh6g2Ada80SjT7hXxdC2xAYopX7U//5zCUBsZj69l/bWcJWWEwFo19BiorgJrTGdZ+mgtHvTpuoCJb7muskOvQ0zNuOjqbgoyCfMoIm2PXjpibt+X5E1vY803EFTbCPJxN10E86pXud7Xmm42qj6AKE7HeNNFoI8R8Fd67ldZjDQQAAAABJRU5ErkJggg=="
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
        fallback="data:image/png;base64,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"
      />
    </>
  );
};

const DeletedPosts: React.FC<{ username: string }> = ({ username }) => {
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
        if (lastGroup.hits.hits.length < 20) return false;

        return lastGroup.hits.hits[lastGroup.hits.hits.length - 1]._source
          .created_at;
      },
    },
  );

  if (isLoading) {
    return (
      <div style={{ width: '100%', marginTop: 30, textAlign: 'center' }}>
        <LoadingOutlined style={{ color: '#fff' }} />
      </div>
    );
  }

  if (isError) {
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

  let deletedPostsLength = 0;

  data.forEach(group => {
    deletedPostsLength += group.hits.hits.length;
  });

  return (
    <Collapse>
      <Collapse.Panel
        header={`Deleted Posts (${deletedPostsLength}${
          deletedPostsLength === 20 ? '+' : ''
        })`}
        key={1}
      >
        {data.map((group, groupIndex, array) => {
          if (!group.hits.hits.length) {
            return (
              <div style={{ textAlign: 'center' }} key="NoResults">
                <Text type="secondary">No results.</Text>
              </div>
            );
          }

          return (
            <div>
              {group.hits.hits.map((postRaw, i) => {
                const post = postRaw._source;

                return (
                  <div style={{ marginBottom: 30 }} key={postRaw._id}>
                    <PostCard data={post} number={groupIndex * 100 + i + 1} />
                    <Divider />
                  </div>
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

const EditedPosts: React.FC<{ username: string }> = ({ username }) => {
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
        if (lastGroup.hits.hits.length < 20) return false;

        return lastGroup.hits.hits[lastGroup.hits.hits.length - 1]._source
          .created_at;
      },
    },
  );

  if (isLoading) {
    return (
      <div style={{ width: '100%', marginTop: 30, textAlign: 'center' }}>
        <LoadingOutlined style={{ color: '#fff' }} />
      </div>
    );
  }

  if (isError) {
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

  let editedPostsLength = 0;

  data.forEach(group => {
    editedPostsLength += group.hits.hits.length;
  });

  return (
    <Collapse>
      <Collapse.Panel
        header={`Edited Posts (${editedPostsLength}${
          editedPostsLength === 20 ? '+' : ''
        })`}
        key={1}
      >
        {data.map((group, groupIndex, array) => {
          if (!group.hits.hits.length) {
            return (
              <div style={{ textAlign: 'center' }} key="NoResults">
                <Text type="secondary">No results.</Text>
              </div>
            );
          }

          return (
            <div key={groupIndex}>
              {group.hits.hits.map((postRaw, i) => {
                const post = postRaw._source;

                return (
                  <div style={{ marginBottom: 30 }} key={postRaw._id}>
                    <PostCard data={post} number={groupIndex * 100 + i + 1} />
                    <Divider />
                  </div>
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
        if (lastGroup.length < 20) return false;

        const last = lastGroup[lastGroup.length - 1];
        return `${last.address},${last.created_at},${last.id}`;
      },
    },
  );

  if (isLoading) {
    return (
      <div style={{ width: '100%', marginTop: 30, textAlign: 'center' }}>
        <LoadingOutlined style={{ color: '#fff' }} />
      </div>
    );
  }

  if (isError) {
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
    group.forEach(address => {
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
              {group.map((address, i) => {
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
  const { data, isLoading, isError } = useQuery(
    `userPostsWeek:${username}`,
    async () => {
      const { data: responseData } = await api.get(`/users/${username}/posts`);

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  const CustomizedAxisTick: React.FC<{
    x: string;
    y: string;
    payload: { value: string };
  }> = ({ x, y, payload }) => {
    if (!payload.value) {
      return (
        <text
          x={Number(x) + 4.5}
          y={Number(y) / 2}
          dy={-10}
          fontSize={15}
          fill="#757575"
          dominantBaseline="middle"
          textAnchor="middle"
        >
          No data
        </text>
      );
    }

    const date = new Date(payload.value);

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={36} y={0} dy={16} textAnchor="end" fill="#666">
          {format(addMinutes(date, date.getTimezoneOffset()), 'yyyy/MM/dd')}
        </text>
      </g>
    );
  };

  if (isLoading) {
    return <LoadingOutlined style={{ color: '#fff' }} />;
  }

  return (
    <>
      <ResponsiveContainer width="100%" aspect={2 / 1}>
        <LineChart
          data={isError ? [{ value: null }] : data.data}
          margin={{ top: 0, left: -55, right: 0, bottom: 0 }}
        >
          <XAxis
            dataKey="key_as_string"
            tick={({ x, y, payload }) => (
              <CustomizedAxisTick x={x} y={y} payload={payload} />
            )}
            domain={['dataMin', 'dataMax']}
            interval={1}
          />
          <YAxis dataKey="doc_count" />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1D1D1D' }}
            label="{timeTaken}"
            labelFormatter={value => {
              const date = new Date(value);

              return `Day: ${
                isValid(new Date(value))
                  ? format(
                      addMinutes(date, date.getTimezoneOffset()),
                      'yyyy/MM/dd',
                    )
                  : null
              }`;
            }}
            formatter={value => [value, 'Posts']}
          />
          <Line type="monotone" dataKey="doc_count" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

const PostsMonthChart: React.FC<{ username: string }> = ({ username }) => {
  const { data, isLoading, isError } = useQuery(
    `userPostsMonth:${username}`,
    async () => {
      const oneMonthAgo = sub(new Date(), { months: 1 }).toISOString();

      const { data: responseData } = await api.get(
        `/users/${username}/posts?from=${oneMonthAgo}`,
      );

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  const CustomizedAxisTick: React.FC<{
    x: string;
    y: string;
    payload: { value: string };
  }> = ({ x, y, payload }) => {
    if (!payload.value) {
      return (
        <text
          x={Number(x) + 4.5}
          y={Number(y) / 2}
          dy={-10}
          fontSize={15}
          fill="#757575"
          dominantBaseline="middle"
          textAnchor="middle"
        >
          No data
        </text>
      );
    }

    const date = new Date(payload.value);

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={36} y={0} dy={16} textAnchor="end" fill="#666">
          {format(addMinutes(date, date.getTimezoneOffset()), 'yyyy/MM/dd')}
        </text>
      </g>
    );
  };

  if (isLoading) {
    return <LoadingOutlined style={{ color: '#fff' }} />;
  }

  return (
    <ResponsiveContainer width="100%" aspect={2 / 1}>
      <LineChart
        data={isError ? [{ value: null }] : data.data}
        margin={{ top: 0, left: -55, right: 0, bottom: 0 }}
      >
        <XAxis
          dataKey="key_as_string"
          tick={({ x, y, payload }) => (
            <CustomizedAxisTick x={x} y={y} payload={payload} />
          )}
          domain={['dataMin', 'dataMax']}
          interval={6}
        />
        <YAxis dataKey="doc_count" />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip
          contentStyle={{ backgroundColor: '#1D1D1D' }}
          label="{timeTaken}"
          labelFormatter={value => {
            const date = new Date(value);

            return `Day: ${
              isValid(new Date(value))
                ? format(
                    addMinutes(date, date.getTimezoneOffset()),
                    'yyyy/MM/dd',
                  )
                : null
            }`;
          }}
          formatter={value => [value, 'Posts']}
        />
        <Line type="monotone" dataKey="doc_count" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

const BoardsChart: React.FC<BoardsChartProps> = ({ data, total, loading }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div style={{ height: 100, textAlign: 'center', marginTop: 30 }}>
        <LoadingOutlined style={{ fontSize: 36 }} />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div style={{ height: 100, textAlign: 'center', marginTop: 30 }}>
        <Text type="secondary">No data</Text>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" aspect={2 / 1.3}>
      <PieChart margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
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
              fill={COLORS[index % COLORS.length]}
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
          (Number(board.count) / data.posts_count_with_boards) *
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
  const [boardsActivityTime, setBoardsActivityTime] = useState('all-time');

  const { data, refetch, isLoading, isFetching } = useQuery(
    `userBoards:${username}`,
    async () => {
      let from = '';
      let to = '';

      const currentDateUTC = addMinutes(
        new Date(),
        new Date().getTimezoneOffset(),
      );

      switch (boardsActivityTime) {
        case 'all-time':
          from = '';
          to = '';
          break;
        case '30-days':
          from = sub(startOfDay(currentDateUTC), { months: 1 }).toISOString();
          to = endOfDay(currentDateUTC).toISOString();
          break;
        case '7-days':
          from = sub(startOfDay(currentDateUTC), { weeks: 1 }).toISOString();
          to = endOfDay(currentDateUTC).toISOString();
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
  }, [boardsActivityTime, refetch]);

  const handleChangeBoardsActivityTime = e => {
    setBoardsActivityTime(e.target.value);
  };

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
          value={boardsActivityTime}
          onChange={handleChangeBoardsActivityTime}
        >
          <Radio.Button value="all-time">All time</Radio.Button>
          <Radio.Button value="30-days">30 days</Radio.Button>
          <Radio.Button value="7-days">7 days</Radio.Button>
        </Radio.Group>
      </Col>
      <Col xs={24} lg={12}>
        <BoardsChart
          data={data?.data.boards}
          total={data?.data.posts_count_with_boards}
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
              <Card>
                <Tabs defaultActiveKey="1">
                  <Tabs.TabPane tab="Mentioned Addresses" key="1">
                    <MentionedAddresses username={data.data.author} />
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="Deleted Posts" key="2">
                    <DeletedPosts username={data.data.author} />
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="Edited Posts" key="3">
                    <EditedPosts username={data.data.author} />
                  </Tabs.TabPane>
                </Tabs>
              </Card>
            </Col>
          </Row>
        </PageContent>
      )}
    </div>
  );
};

export default User;
