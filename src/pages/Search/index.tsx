import React, { useEffect, useState } from 'react';
import { useInfiniteQuery, useQuery } from 'react-query';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Divider,
  BackTop,
  Radio,
  Tabs,
  Checkbox,
  Tooltip,
} from 'antd';
import { SearchOutlined, LoadingOutlined, InfoCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { format } from 'date-fns-tz';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import { autorun } from 'mobx';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import numeral from 'numeral';
import { addMinutes } from 'date-fns';

import { Observer } from 'mobx-react';
import api from '../../services/api';
import { useSearchStore } from '../../stores/SearchStore';

import Header from '../../components/Header';
import PostCard from '../../components/PostCard';
import HeaderPostCard from '../../components/HeaderPostCard';
import CompactPostCard from '../../components/CompactPostCard';
import DatePicker from '../../components/DatePicker';
import BoardSelect from '../../components/BoardSelect';
import TopicId from '../../components/Input/TopicId';

import { PageContent } from './styles';

const { Text } = Typography;

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
  created_at: Date;
  updated_at: Date;
}

interface Data {
  total_results: number;
  posts: Post[];
}

interface Response {
  data: Data;
}

const AuthorsTab: React.FC = () => {
  const store = useSearchStore();
  const { searchQuery } = store;

  const [generated, setGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resultFormat, setResultFormat] = useState('{number}. {username} [{count}]');
  const [limit, setLimit] = useState('1000');

  const { data, refetch, isError } = useQuery(
    'posts:Authors',
    async () => {
      const { author, content, title, topic_id, after_date, before_date, board, child_boards } = searchQuery.posts;

      setGenerated(true);
      setIsLoading(true);

      const { data: responseData } = await api.get('posts/authors', {
        params: {
          author,
          content,
          title,
          topic_id,
          board,
          child_boards,
          after_date,
          before_date,
          limit,
        },
      });

      setIsLoading(false);

      return responseData;
    },
    { enabled: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  const resultText =
    !isLoading &&
    !isError &&
    data?.data.authors?.reduce((prev, curr, i, array) => {
      const resultFormatted = resultFormat
        .replace(/{username}/g, curr.author)
        .replace(/{count}/g, curr.count)
        .replace(/{uid}/g, curr.author_uid)
        .replace(/{number}/g, i + 1);
      let text = `${prev}${resultFormatted}`;

      if (i !== array.length - 1) {
        text += '\n';
      }

      return text;
    }, '');

  return (
    <div>
      <Card title="Generate list of users from the result">
        <Col span={24} style={{ textAlign: 'right' }}>
          <Form.Item label="Format">
            <Input
              placeholder="{number}. {username} [{count}]"
              value={resultFormat}
              onChange={e => setResultFormat(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Limit">
            <Input placeholder="1000" value={limit} onChange={e => setLimit(e.target.value)} type="number" min={1} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <Text style={{ fontWeight: 400 }}>Variables available: </Text>
              <Text type="secondary">{'{number} {username} {uid} {count}'}</Text>
            </div>
            <Button onClick={() => refetch()} disabled={!resultFormat}>
              Generate
            </Button>
          </div>
        </Col>
      </Card>
      {generated ? (
        <Card title={`Results (${data?.data?.total_results || 0})`} style={{ marginTop: 15 }}>
          {isLoading && !isError ? (
            <div style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
              <LoadingOutlined style={{ fontSize: 24 }} />
            </div>
          ) : null}
          {!isLoading && !isError ? (
            <Input.TextArea value={resultText} contentEditable={false} autoSize={{ minRows: 3, maxRows: 10 }} />
          ) : null}
          {isError ? <Text type="secondary">Something went wrong</Text> : null}
        </Card>
      ) : null}
    </div>
  );
};

const SearchResults = ({
  data,
  canFetchMore,
  postsViewType,
}: {
  data: Response[];
  canFetchMore: boolean;
  postsViewType: string;
}) => {
  const store = useSearchStore();
  const { ignoredThreads, addIgnoredThread } = store;

  const LoadingMore = ({ groupIndex, onlyIcon = false }) => {
    if (groupIndex === data.length - 1) {
      if (!canFetchMore) {
        return (
          <div style={{ textAlign: 'center', marginTop: 25 }}>
            <Text type="secondary">You reached the end!</Text>
          </div>
        );
      }

      return onlyIcon ? (
        <div style={{ width: '100%', marginTop: 30, textAlign: 'center' }}>
          <LoadingOutlined style={{ fontSize: 30 }} />
        </div>
      ) : (
        <Card loading style={{ marginTop: 30 }} />
      );
    }
    return null;
  };

  return (
    <Observer>
      {() => (
        <div>
          {data.map((group, groupIndex) => {
            if (!group.data.posts.length) {
              return (
                <Card key={groupIndex}>
                  <Text strong key={1}>
                    No results...
                  </Text>
                </Card>
              );
            }

            return group.data.posts
              .filter(post => !ignoredThreads.find(ignoredThread => ignoredThread.id === post.topic_id))
              .map((post, i, array) => {
                switch (postsViewType) {
                  case 'normal':
                    return (
                      <div style={{ marginBottom: 30 }} key={post.post_id}>
                        <PostCard data={post} number={groupIndex * 100 + i + 1} hightlight={null} />
                        <Button
                          style={{ marginTop: 5 }}
                          size="small"
                          onClick={() => addIgnoredThread({ id: post.topic_id, title: post.title })}
                        >
                          Ignore Topic
                        </Button>
                        <Divider />
                        {i === array.length - 1 ? <LoadingMore groupIndex={groupIndex} /> : null}
                      </div>
                    );
                  case 'collapsed':
                    return (
                      <div key={post.post_id}>
                        <HeaderPostCard data={post} number={groupIndex * 100 + i + 1} />
                        <Button
                          style={{ marginTop: 5, marginBottom: 15 }}
                          size="small"
                          onClick={() => addIgnoredThread({ id: post.topic_id, title: post.title })}
                        >
                          Ignore Topic
                        </Button>
                        {i === array.length - 1 ? <LoadingMore groupIndex={groupIndex} /> : null}
                      </div>
                    );
                  case 'compact':
                    return (
                      <ul
                        key={post.post_id}
                        style={{
                          paddingInlineStart: 20,
                          marginBottom: 0,
                        }}
                      >
                        <CompactPostCard data={post} number={groupIndex * 100 + i + 1} />
                        {i === array.length - 1 ? <LoadingMore groupIndex={groupIndex} onlyIcon /> : null}
                      </ul>
                    );
                  default:
                    return null;
                }
              });
          })}
        </div>
      )}
    </Observer>
  );
};

const Search: React.FC = () => {
  const { search } = useLocation();
  const history = useHistory();

  const [postsViewType, setPostsViewType] = useState('normal');

  const store = useSearchStore();
  const { setValue, searchQuery, isLoadingSearch, setIsLoadingSearch, ignoredThreads, removeIgnoredThread } = store;

  const { isLoading, isFetching, isError, refetch, fetchMore, canFetchMore, data } = useInfiniteQuery<Response>(
    'posts',
    async (key, lastId = null) => {
      const { author, content, title, topic_id, after_date, before_date, board, child_boards } = searchQuery.posts;

      const { data: responseData } = await api.get('posts', {
        params: {
          author,
          content,
          title,
          topic_id,
          board,
          child_boards,
          after_date,
          before_date,
          last: lastId,
          limit: 100,
        },
      });

      setIsLoadingSearch(false);
      return responseData;
    },
    {
      enabled: false,
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      getFetchMore: lastGroup => {
        if (lastGroup.data.posts.length < 100) return false;

        return lastGroup.data.posts[lastGroup.data.posts.length - 1].post_id;
      },
    },
  );

  const redirectToQuery = () => {
    const queryStringified = queryString.stringify(
      {
        author: searchQuery.posts.author,
        topic_id: searchQuery.posts.topic_id,
        title: searchQuery.posts.title,
        content: searchQuery.posts.content,
        after_date: searchQuery.posts.after_date,
        before_date: searchQuery.posts.before_date,
        board: searchQuery.posts.board,
        child_boards: searchQuery.posts.child_boards,
      },
      { skipEmptyString: true, skipNull: true },
    );

    history.push(`/search?${queryStringified}`);
  };

  const searchPosts = () => {
    setIsLoadingSearch(true);
    refetch();
  };

  autorun(() => {
    const query = queryString.parse(search);

    const topicRegex = new RegExp(/https:\/\/bitcointalk\.org\/index\.php\?topic=(\d+)/, 'i');
    const topicMatch = String(query.topic_id)?.match(topicRegex);

    const topicId = topicMatch ? topicMatch[1] : query.topic_id;

    setValue('posts', 'author', query.author);
    setValue('posts', 'title', query.title);
    setValue('posts', 'content', query.content);
    setValue('posts', 'topic_id', topicId);
    setValue('posts', 'after_date', query.after_date);
    setValue('posts', 'before_date', query.before_date);
    setValue('posts', 'board', query.board);
    setValue('posts', 'child_boards', query.child_boards);
  });

  useEffect(() => {
    if (Object.keys(searchQuery.posts).filter(key => searchQuery.posts[key]).length) {
      searchPosts();
    }
  }, []);

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      redirectToQuery();
      searchPosts();
    }
  };

  const handleChangeDateRange = e => {
    const from = e && e[0] ? format(new Date(e[0]), "yyyy-MM-dd'T'HH:mm:ss") : '';
    const to = e && e[1] ? format(new Date(e[1]), "yyyy-MM-dd'T'HH:mm:ss") : '';

    setValue('posts', 'after_date', from);
    setValue('posts', 'before_date', to);
  };

  useBottomScrollListener(() => {
    if (!canFetchMore || isFetching) return;

    fetchMore();
  }, 500);

  const afterDate = searchQuery.posts.after_date
    ? addMinutes(new Date(searchQuery.posts.after_date), new Date(searchQuery.posts.after_date).getTimezoneOffset())
    : null;

  const beforeDate = searchQuery.posts.before_date
    ? addMinutes(new Date(searchQuery.posts.before_date), new Date(searchQuery.posts.before_date).getTimezoneOffset())
    : null;

  return (
    <div>
      <Header />
      <PageContent>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={24} lg={8}>
            <Card title="Search params" type="inner">
              <Form layout="vertical" size="large">
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item label="Author">
                      <Input
                        placeholder="TryNinja"
                        defaultValue={searchQuery.posts.author}
                        onKeyDown={handleKeyDown}
                        onChange={e => setValue('posts', 'author', e.target.value.trim())}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Topic ID">
                      <TopicId searchPosts={searchPosts} redirectToQuery={redirectToQuery} />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item
                      label={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Typography style={{ marginRight: 5 }}>Post Title</Typography>
                          <Tooltip
                            title={
                              <div>
                                <article style={{ fontWeight: 500 }}>Advanced search:</article>
                                <article>+ for AND operations</article>
                                <article>| for OR operations</article>
                                <article>- to negate a word/phrase/precedence</article>
                                <article>&quot; wraps a phrase (for exact matches)</article>
                                <article>( and ) for precedence</article>
                              </div>
                            }
                          >
                            <InfoCircleOutlined />
                          </Tooltip>
                        </div>
                      }
                    >
                      <Input
                        placeholder="Scam accusation"
                        maxLength={550}
                        defaultValue={searchQuery.posts.title}
                        onKeyDown={handleKeyDown}
                        onChange={e => setValue('posts', 'title', e.target.value)}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item
                      label={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Typography style={{ marginRight: 5 }}>Post Content</Typography>
                          <Tooltip
                            title={
                              <div>
                                <article style={{ fontWeight: 500 }}>Advanced search:</article>
                                <article>+ for AND operations</article>
                                <article>| for OR operations</article>
                                <article>- to negate a word/phrase/precedence</article>
                                <article>&quot; wraps a phrase (for exact matches)</article>
                                <article>( and ) for precedence</article>
                              </div>
                            }
                          >
                            <InfoCircleOutlined />
                          </Tooltip>
                        </div>
                      }
                    >
                      <Input
                        placeholder="Bitcoin"
                        maxLength={550}
                        defaultValue={searchQuery.posts.content}
                        onKeyDown={handleKeyDown}
                        onChange={e => setValue('posts', 'content', e.target.value)}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item label="Date Range (UTC)">
                      <DatePicker.RangePicker
                        showTime
                        allowEmpty={[true, true]}
                        defaultValue={[afterDate, beforeDate]}
                        onChange={handleChangeDateRange}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item label="Board">
                      <BoardSelect searchQueryField="board" type="posts" />
                      <Checkbox
                        style={{ marginTop: 15 }}
                        defaultChecked={searchQuery.posts.child_boards}
                        onChange={e => setValue('posts', 'child_boards', e.target.checked)}
                      >
                        Include child boards
                      </Checkbox>
                    </Form.Item>
                  </Col>

                  <Col span={24} style={{ textAlign: 'right' }}>
                    <Form.Item>
                      <Button
                        type="primary"
                        icon={
                          isFetching || isLoading || (isLoadingSearch && !isError) ? (
                            <LoadingOutlined style={{}} />
                          ) : (
                            <SearchOutlined />
                          )
                        }
                        disabled={isFetching || isLoading || (isLoadingSearch && !isError)}
                        onClick={() => {
                          searchPosts();
                          redirectToQuery();
                        }}
                      >
                        Search
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>

            <Observer>
              {() =>
                ignoredThreads.length > 0 ? (
                  <Card style={{ marginTop: 10 }} title="Ignored Topics">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {ignoredThreads.map((ignoredThread, index, array) => (
                        <div key={ignoredThread.id}>
                          <Text style={{ fontSize: 12 }}>
                            <b>{ignoredThread.id}</b> -{ignoredThread.title}
                            <Button
                              icon={<DeleteOutlined />}
                              style={{ marginLeft: 10 }}
                              size="small"
                              onClick={() => removeIgnoredThread(ignoredThread.id)}
                            />
                          </Text>
                          {index < array.length ? <Divider style={{ marginTop: 5, marginBottom: 5 }} /> : null}
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : null
              }
            </Observer>
          </Col>
          <Col xs={24} md={24} lg={16}>
            {(!data || isLoading || isLoadingSearch) && !isError ? (
              <Card
                title="What do you want to find today?"
                loading={isLoading || isFetching || isLoadingSearch}
                type="inner"
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Text>Do your search on the card on the side</Text>
                  <Text>or</Text>
                  <Text>Just click the button and get the latest posts.</Text>
                </div>
              </Card>
            ) : null}
            {isError ? (
              <Card>
                <Text strong key={1}>
                  Something went wrong...
                </Text>
              </Card>
            ) : null}
            {data && !isLoading && !isLoadingSearch && !isError ? (
              <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Results" key="1">
                  <div style={{ marginBottom: 15 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {data && !isLoading && !isLoadingSearch ? (
                        <div>
                          <Text style={{ fontWeight: 500 }}>Total results:</Text>{' '}
                          <Text>{numeral(data[0].data.total_results || 0).format('0,0')}</Text>
                        </div>
                      ) : null}
                      <div>
                        {/* {searchQuery.content ? (
                          <>
                            <Switch
                              style={{ marginRight: 5 }}
                              defaultChecked={hightlight}
                              checked={hightlight}
                              onChange={value => setHightlight(value)}
                            />
                            <Text style={{ marginRight: 10 }}>Hightlight</Text>
                          </>
                        ) : null} */}
                        <Radio.Group
                          onChange={e => setPostsViewType(e.target.value)}
                          value={postsViewType}
                          defaultValue="normal"
                        >
                          <Radio.Button value="normal">Normal</Radio.Button>
                          <Radio.Button value="collapsed">Collapsed</Radio.Button>
                          <Radio.Button value="compact">Compact</Radio.Button>
                        </Radio.Group>
                      </div>
                    </div>
                  </div>
                  <SearchResults data={data} canFetchMore={canFetchMore} postsViewType={postsViewType} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Users" key="2">
                  <AuthorsTab />
                </Tabs.TabPane>
              </Tabs>
            ) : null}
          </Col>
        </Row>
        <BackTop />
      </PageContent>
    </div>
  );
};

export default Search;
