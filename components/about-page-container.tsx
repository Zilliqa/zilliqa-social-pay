import styled from 'styled-components';

import { Container } from 'components/container';
import { Img } from 'components/img';
import { Text } from 'components/text';

export const AboutContainer = styled(Container)`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-evenly;

  background-image: linear-gradient(180.35deg, #7882F3 -3.17%, #7882F3 42.83%, #7882F3 80.35%, #5352EE 98.93%);
  height: 100vh;
  width: 100vw;

  @media (max-width: 650px) {
    text-align: center;
    font-size: 30px;
    align-items: unset;
  }
`;
export const InfoContainer = styled.div`
  width: 100%;
  max-width: 390px;

  padding-left: 10px;
  padding-right: 10px;
  z-index: 2;
`;

export const ZilliqaLogo = styled(Img)`
  position: fixed;
  top: 0px;
  right: 20px;

  width: 70px;

  @media (max-width: 321px) {
    width: 30px;
    height: 60px;
  }
`;

export const Illustration = styled(Img)`
  width: 50vw;
  height: 50vw;

  @media (max-width: 640px) {
    width: 80vw;
    height: 80vw;
  }
`;

export const TitleText = styled(Text)`
  font-size: 40px;

  @media (max-width: 650px) {
    text-align: center;
    font-size: 30px;
  }
`;
export const DescriptionText = styled(Text)`
  @media (max-width: 650px) {
    text-align: center;
    font-size: 15px;
  }
`;

ZilliqaLogo.defaultProps = {
  src: '/icons/zilliqa-logo.svg'
};
