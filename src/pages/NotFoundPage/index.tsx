import React from 'react';

import { Typography } from 'antd';
import Header from '../../components/Header';

import { PageContent } from './styles';

const NotFoundPage: React.FC = () => {
  return (
    <>
      <Header />
      <PageContent>
        <Typography.Title>404 Not Found</Typography.Title>
        <Typography.Text>
          It looks like you are lost. This page does not exist.
        </Typography.Text>
      </PageContent>
    </>
  );
};

export default NotFoundPage;
