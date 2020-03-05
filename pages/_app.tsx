import 'react-responsive-carousel/lib/styles/carousel.min.css';

import { createGlobalStyle } from 'styled-components';
import Head from 'next/head';
import App from 'next/app';
import fetch from 'isomorphic-unfetch';

import UserStore from 'store/user';

import { Container } from 'components/container';

import { Fonts } from 'config';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: ${Fonts.AvenirNextLTProBold};
    src: url('/fonts/AvenirNextLTPro-Bold.otf');
  }
  @font-face {
    font-family: ${Fonts.AvenirNextLTProDemi};
    src: url('/fonts/AvenirNextLTPro-Demi.otf');
  }
  @font-face {
    font-family: ${Fonts.AvenirNextLTProDemiIt};
    src: url('/fonts/AvenirNextLTPro-DemiIt.otf');
  }
  @font-face {
    font-family: ${Fonts.AvenirNextLTProHeavyCn};
    src: url('/fonts/AvenirNextLTPro-HeavyCn.otf');
  }
  @font-face {
    font-family: ${Fonts.AvenirNextLTProIt};
    src: url('/fonts/AvenirNextLTPro-It.otf');
  }
  @font-face {
    font-family: ${Fonts.AvenirNextLTProRegular};
    src: url('/fonts/AvenirNextLTPro-Regular.otf');
  }

  body, html {
    margin: 0;
    padding: 0;

    font-family: ${Fonts.AvenirNextLTProRegular};
  }

  * {
    box-sizing: border-box;
  }
`;

class SocialPay extends App {

  public componentDidMount() {
    UserStore.update();
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
        <GlobalStyle />
        <Component {...pageProps} />
      </Container>
    );
  }
}

SocialPay.getInitialProps = async () => {
  const res = await fetch('http://localhost:3000/api/v1/user');
  const json = await res.text();

  return {
    pageProps: {
      stars: json
    }
  };
};

export default SocialPay;
