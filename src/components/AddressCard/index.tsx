import React from 'react';
import { Collapse } from 'antd';
import { Link } from 'react-router-dom';

import AddressAuthorsCard from '../AddressAuthorsCard';
import AddressPostCard from '../AddressPostCard';

interface Address {
  id: string;
  coin: string;
  address: string;
  posts_id: number[];
  authors?: string[];
  authors_uid?: number[];
}

interface Props {
  data: Address;
  number: number;
}

const AddressCard: React.FC<Props> = ({ data, number }) => {
  return (
    <Collapse>
      <Collapse.Panel
        key={data.address}
        header={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              wordWrap: 'break-word',
              maxWidth: '100%',
            }}
          >
            <Link
              to={`/address/${data.address}`}
              style={{
                fontWeight: 500,
                wordWrap: 'break-word',
                maxWidth: '90%',
              }}
            >
              {data.address} [{data.coin}] ({data.posts_id.length})
            </Link>

            <div>
              (#
              {number})
            </div>
          </div>
        }
      >
        <div style={{ marginBottom: 10 }}>
          <AddressAuthorsCard address={data.address} />
        </div>
        <AddressPostCard postsId={data.posts_id} />
      </Collapse.Panel>
    </Collapse>
  );
};

export default AddressCard;
