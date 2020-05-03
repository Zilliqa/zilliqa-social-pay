import { createGlobalStyle } from 'styled-components';
import { Fonts } from 'config';

export const BaseStyles = createGlobalStyle`
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

  button {
    cursor: pointer;
    border-radius: 20px;
    width: 150px;

    background: transparent;
    border: 1px solid #fff;
    color: #fff;
    padding: 10px;
    letter-spacing: 1px;

    transition: all 0.5s ease-out;

    font-family: ${Fonts.AvenirNextLTProRegular};

    :hover {
      background: #fff;
      color: #5C63EF;
      border: 1px solid transparent;
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

  .pagination.desktop {
    min-width: 500px;
  }
  .pagination.mobile {
    min-width: 300px;
  }

  .pagination {
    display: flex;

    margin: 0;
    padding: 0;
    padding-left: 100px;
    margin-bottom: 30px;
    margin-top: 30px;

    li {
      list-style-type: none;
      margin-left: 10px;

      a {
        cursor: pointer;
        min-width: 100px;
        border-radius: 30px;
        background: transparent;
        border: 1px solid #fff;
        color: #fff;
        transition: all 0.5s ease-out;
        padding: 9px 12px 9px 12px;

        :hover {
          background: #fff;
          color: #5C63EF;
          border: 1px solid transparent;
        }
      }
    }

    li.active {
      a {
        background: #fff;
        color: #5C63EF;
        border: 1px solid transparent;
      }
    }

    li.disabled > a {
      cursor: unset;
      :hover {
        background: transparent;
        color: #fff;
        border: 1px solid #fff;
      }
    }

    @media (max-width: 440px) {
      padding: 0;
    }
  }
`;
