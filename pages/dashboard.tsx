import { useContext, useEffect } from 'react';
import { Can } from '../components/can';
import { AuthContext } from '../Contexts/AuthContext';
import { useCan } from '../hooks/useCan';
import { setupAPIClient } from '../services/api';
import { api } from '../services/apiClient';
import { withSSRAuth } from '../utils/withSSRAuth';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const userCanSeeMetrics = useCan({
    permissions: ['metrics.list'],
  });

  useEffect(() => {
    api
      .get('/me')
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log('error', error);
      });
  }, []);

  return (
    <>
      <h1>Dashboard {user?.email}</h1>
      {userCanSeeMetrics && <div>Métricas</div>}

      <Can permissions={['metrics.list']}>
        <h3>Can see</h3>
      </Can>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx as any);
  const response = await apiClient.get('/me');
  console.log(response);

  return {
    props: {},
  };
});
