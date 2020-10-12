import React from 'react';
import { useQuery } from 'react-query';
import { Alert } from 'antd';

import api from '../../services/api';

const AlertMessage: React.FC = () => {
  const { data, isLoading, isError } = useQuery(
    'alertMessage',
    async () => {
      const { data: responseData } = await api.get('/alerts');

      return responseData;
    },
    { refetchOnMount: false, refetchOnWindowFocus: false, retry: false },
  );

  if (isLoading || isError || !data || !data.data) {
    return null;
  }

  return (
    <Alert
      message={data.data}
      type="info"
      showIcon
      style={{ marginBottom: 15 }}
    />
  );
};

export default AlertMessage;
