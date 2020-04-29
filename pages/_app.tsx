import Head from 'next/head';
import App from 'next/app';

import UserStore from 'store/user';
import BrowserStore from 'store/browser';
import EventStore from 'store/event';

import { Container } from 'components/container';
import { FixedWrapper } from 'components/fixed-wrapper';

import { ImgFormats } from 'config';
import { authGuard } from 'utils/guard';
import { supportsWebp } from 'utils/webp-support';

import { BaseStyles, AnimateStyles } from 'styles';

class SocialPay extends App {

  public componentDidMount() {
    supportsWebp()
      .then((isWebp) => isWebp ? null : BrowserStore.setformat(ImgFormats.png));

    if (typeof window !== 'undefined') {
      UserStore.getJWT();

      const userState = UserStore.store.getState();

      if (!userState.jwtToken || !this.props.pageProps.user) {
        UserStore.clear();
        EventStore.signOut(null);
        this.props.router.push('/about');
      } else if (this.props.pageProps.user) {
        UserStore.setUser(this.props.pageProps.user);
      }

      if (this.props.router.route.includes('about')) {
        return null;
      } else if (this.props.router.route.includes('auth')) {
        return null;
      }
    }
  }

  public render() {
    const { Component, pageProps } = this.props;

    return (
      <Container>
        <Head>
          <title>SocialPay</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="shortcut icon" href="/favicon.ico" />
        </Head>
        <BaseStyles />
        <AnimateStyles />
        <FixedWrapper />
        <Component {...pageProps} />
      </Container>
    );
  }
}

SocialPay.getInitialProps = async ({ Component, ctx }: any) => {
  //
  // Check whether the page being rendered by the App has a
  // static getInitialProps method and if so call it
  //
  let pageProps = authGuard(ctx);

  if (Boolean(Component.getInitialProps)) {
    pageProps = await Component.getInitialProps(ctx);
  }

  return { pageProps };
};

export default SocialPay;
