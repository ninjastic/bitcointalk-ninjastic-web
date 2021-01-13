import React, { useState } from 'react';
import { Input } from 'antd';

import { useSearchStore } from '../../../stores/SearchStore';

interface Params {
  searchPosts: () => any;
}

const TopicId: React.FC<Params> = ({ searchPosts }) => {
  const store = useSearchStore();

  const { setValue, searchQuery } = store;

  const [topicId, setTopicId] = useState(searchQuery.topic_id);

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      searchPosts();
    }
  };

  const handleChange = (e: any) => {
    setValue('topic_id', e.target.value);
    setTopicId(e.target.value);
  };

  const handlePaste = (e: any) => {
    const topicRegex = new RegExp(/https:\/\/bitcointalk\.org\/index\.php\?topic=(\d+)/, 'i');
    const paste = e.clipboardData.getData('Text');

    const matchRegex = paste.match(topicRegex);

    if (matchRegex && matchRegex[1]) {
      e.preventDefault();
      setValue('topic_id', matchRegex[1]);
      setTopicId(matchRegex[1]);
    }
  };

  return (
    <Input
      placeholder="5248878"
      type="number"
      min={1}
      defaultValue={searchQuery.topic_id}
      value={topicId}
      onKeyDown={handleKeyDown}
      onPaste={e => handlePaste(e)}
      onChange={e => handleChange(e)}
    />
  );
};

export default TopicId;
