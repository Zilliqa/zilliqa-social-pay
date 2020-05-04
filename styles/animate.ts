import { createGlobalStyle } from 'styled-components';

export const AnimateStyles = createGlobalStyle`
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

  @keyframes fadeShow {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes spin {
    100% {
      transform:rotate(360deg);
    }
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translate3d(0, -100%, 0);
    }

    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }
`;
