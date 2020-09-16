import React from 'react';
import { Result, Button } from 'antd';
import { useHistory } from 'react-router-dom';

import Header from '../../components/Header';

import { PageContent } from './styles';

const NotFoundPage: React.FC = () => {
  const history = useHistory();

  return (
    <>
      <Header />
      <PageContent>
        <Result
          status="404"
          title="404"
          subTitle="Sorry, the page you visited does not exist."
          extra={
            <Button type="primary" onClick={() => history.push('/')}>
              Back Home
            </Button>
          }
        />
      </PageContent>
    </>
  );
};

export default NotFoundPage;
