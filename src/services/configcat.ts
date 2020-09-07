import * as configcat from 'configcat-js';

const configCatClient = configcat.createClient(
  process.env.REACT_APP_CONFIG_CAT_SDK_KEY,
);

export default configCatClient;
