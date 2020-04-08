import 'react-notifications/lib/notifications.css';

import { createGlobalStyle } from 'styled-components';
import Head from 'next/head';
import App from 'next/app';

import UserStore from 'store/user';
import BrowserStore from 'store/browser';

import { Container } from 'components/container';
import { FixedWrapper } from 'components/fixed-wrapper';

import { Fonts, ImgFormats } from 'config';
import { authGuard } from 'utils/guard';
import { supportsWebp } from 'utils/webp-support';

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

  @keyframes fadeInUp {
    from {
      transform: translate3d(0, 100%, 0);
    }

    to {
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes fade {
    from {
      opacity: 0;
    }

    to {
      opacity: 0.5;
    }
  }

  @keyframes spin {
    100% {
      transform:rotate(360deg);
    }
  }

  .rc-steps-label-vertical .rc-steps-item-description {
    text-align: center;
  }
  .ReactModal__Overlay {
    z-index: 99;
    perspective: 600;
    opacity: 0;
  }

  .ReactModal__Overlay--after-open {
    opacity: 1;
    transition: opacity 150ms ease-out;
  }

  .ReactModal__Content {
    transform: scale(0.5) rotateX(-30deg);
  }

  .ReactModal__Content--after-open {
    transform: scale(1) rotateX(0deg);
    transition: all 150ms ease-in;
  }

  .ReactModal__Overlay--before-close {
    opacity: 0;
  }

  .ReactModal__Content--before-close {
    transform: scale(0.5) rotateX(30deg);
    transition: all 150ms ease-in;
  }

  .ReactModal__Body--open,
  .ReactModal__Html--open {
    overflow: hidden;
  }

  .pagination {
    display: flex;

    margin: 0;
    padding: 0;
    padding-left: 40px;
    margin-bottom: 15px;

    li {
      list-style-type: none;
      margin-left: 10px;

      a {
        cursor: pointer;
        min-width: 100px;
        border-radius: 30px;
        background: transparent;
        border: 0.1rem solid #fff;
        color: #fff;
        transition: all 0.5s ease-out;
        padding: 9px 12px 9px 12px;

        :hover {
          background: #fff;
          color: #5C63EF;
          border: 0.1rem solid transparent;
        }
      }
    }

    li.active {
      a {
        background: #fff;
        color: #5C63EF;
        border: 0.1rem solid transparent;
      }
    }

    li.disabled > a {
      cursor: unset;
      :hover {
        background: transparent;
        color: #fff;
        border: 0.1rem solid #fff;
      }
    }
  }
`;

class SocialPay extends App {

  public componentDidMount() {
    supportsWebp()
      .then((isWebp) => isWebp ? null : BrowserStore.setformat(ImgFormats.png));

    if (this.props.router.route.includes('auth')) {
      return null;
    } else if (this.props.router.route.includes('about')) {
      return null;
    }

    if (typeof window !== 'undefined') {
      UserStore.update();

      const state = UserStore.store.getState();

      if (!state || !state.jwtToken || state.message === 'Unauthorized') {
        UserStore.clear();

        this.props.router.push('/about');
      }
    }

    if (!this.props.pageProps.user) {
      window.localStorage.clear();

      if (this.props.pageProps.firstStart) {
        this.props.router.push('/about');
      } else {
        this.props.router.push('/auth');
      }
    } else {
      UserStore.setUser(this.props.pageProps.user);
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
        <GlobalStyle />
        <Component {...pageProps} />
        <FixedWrapper />
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
