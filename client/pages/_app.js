import 'bootstrap/dist/css/bootstrap.css';

import { Fragment } from 'react';

import Header from '../components/Header';

import buildClient from '../api/build-client';

const AppComponent = ({ Component, pageProps, current_user }) => {
  return (
    <Fragment>
      <Header current_user={current_user}/>
      <div className="container">
        <Component {...pageProps} current_user={current_user}/>
      </div>
    </Fragment>
  );
};

AppComponent.getInitialProps = async appContext => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.current_user);
  }

  return {
    pageProps,
    ...data,
  };
};

export default AppComponent;
