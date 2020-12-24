import Head from 'next/head';
import App from 'next/app';
import dynamic from 'next/dynamic';

import UserStore from 'store/user';
import BrowserStore from 'store/browser';
import BlockchainStore from 'store/blockchain';

const Container = dynamic(() => import('components/container'));
import { FixedWrapper } from 'components/fixed-wrapper';

import { ImgFormats } from 'config';
import { authGuard } from 'utils/guard';
import { supportsWebp } from 'utils/webp-support';

import { BaseStyles, AnimateStyles } from 'styles';

import { description } from 'package.json';

class SocialPay extends App {

  public state = {
    loaded: false
  };

  public async componentDidMount() {
    const isWebp = await supportsWebp();
    let { blockchainInfo, recaptcha } = this.props.pageProps;

    if (recaptcha && recaptcha.RECAPTCHA_SITE_KEY) {
      BrowserStore.setRecaptchaKey(recaptcha.RECAPTCHA_SITE_KEY);
    }

    if (!isWebp) {
      BrowserStore.setformat(ImgFormats.png);
    }

    if (!blockchainInfo) {
      blockchainInfo = await BlockchainStore.updateBlockchain(null);
    }

    BlockchainStore.updateStore(blockchainInfo);

    if (typeof window !== 'undefined') {
      UserStore.getJWT();

      if (this.props.pageProps.user) {
        UserStore.setUser(this.props.pageProps.user);
      }
    }

    this.setState({ loaded: true });
  }

  public render() {
    const { Component, pageProps } = this.props;

    return (
      <Container>
        <Head>
          <title>SocialPay</title>
          <meta name="description" content={description} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="https://twitter.com/zilliqa" />
          <meta name="twitter:creator" content="@zilliqa" />
          <meta name="twitter:title" content="SocialPay by Zilliqa (Instead of Zilliqa)" />
          <meta name="twitter:description" content="Rewarding Twitter users with ZIL for spreading the positivity." />
          <link rel="apple-touch-icon" sizes="57x57" href="/favicons/apple-icon-57x57.png" />
          <link rel="apple-touch-icon" sizes="60x60" href="/favicons/apple-icon-60x60.png" />
          <link rel="apple-touch-icon" sizes="72x72" href="/favicons/apple-icon-72x72.png" />
          <link rel="apple-touch-icon" sizes="76x76" href="/favicons/apple-icon-76x76.png" />
          <link rel="apple-touch-icon" sizes="114x114" href="/favicons/apple-icon-114x114.png" />
          <link rel="apple-touch-icon" sizes="120x120" href="/favicons/apple-icon-120x120.png" />
          <link rel="apple-touch-icon" sizes="144x144" href="/favicons/apple-icon-144x144.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/favicons/apple-icon-152x152.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-icon-180x180.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/favicons/android-icon-192x192.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="96x96" href="/favicons/favicon-96x96.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta name="msapplication-TileImage" content="/favicons/ms-icon-144x144.png" />
          <meta name="theme-color" content="#ffffff" />
          <script src="https://www.google.com/recaptcha/api.js" async defer></script>
        </Head>
        <BaseStyles />
        <AnimateStyles />
        <FixedWrapper />
        {this.state.loaded ? <Component {...pageProps} /> : null }
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
