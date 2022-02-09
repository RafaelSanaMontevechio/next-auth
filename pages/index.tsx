import type { GetServerSideProps, NextPage } from 'next';
import { FormEvent, useContext, useState } from 'react';
import { AuthContext } from '../Contexts/AuthContext';

import { parseCookies } from 'nookies';

import styles from '../styles/Home.module.css';
import { withSSRGuest } from '../utils/withSSRGuest';

const Home: NextPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const data = { email, password };

    await signIn(data);
  }

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Entrar</button>
    </form>
  );
};

export const getServerSideProps = withSSRGuest<{
  users: string[];
}>(async (ctx) => {
  return {
    props: {
      users: ['user'],
    },
  };
});

export default Home;
