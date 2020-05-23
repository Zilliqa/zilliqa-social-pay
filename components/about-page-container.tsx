import styled from 'styled-components';

import { Container } from 'components/container';
import { Img } from 'components/img';
import { Text } from 'components/text';

/**
 * Just css container for About pages.
 * @prop css - Any css code.
 * @example
 * import { AboutContainer } from 'components/about-page-container';
 * <AboutContainer>
 *   Any content.
 * </AboutContainer>
 * <AboutContainer css="width: 30px;">
 *   Any content.
 * </AboutContainer>
 */
export const AboutContainer = styled(Container)`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-evenly;

  background-image: linear-gradient(180.35deg, #7882F3 -3.17%, #7882F3 42.83%, #7882F3 80.35%, #5352EE 98.93%);
  min-height: 100vh;
  width: 100vw;

  @media (max-width: 650px) {
    text-align: center;
    font-size: 30px;
    align-items: unset;
    padding-top: 20vh;
    padding-bottom: 10vh;
  }

  @media (max-width: 321px) {
    padding-top: 5vh;
    padding-bottom: 5vh;
  }
`;
/**
 * Just css container for About page info and any texts.
 * @prop css - Any css code.
 * @example
 * import { InfoContainer } from 'components/about-page-container';
 * <InfoContainer>
 *   Any content.
 * </InfoContainer>
 * <InfoContainer css="font-size: 5.5rem;">
 *   Any content.
 * </InfoContainer>
 */
export const InfoContainer = styled.div`
  width: 100%;
  max-width: 390px;

  padding-left: 10px;
  padding-right: 10px;
  z-index: 2;
`;

/**
 * Zilliqa logo with default src='/icons/zilliqa-logo.svg';
 * @prop css - Any css code.
 * @example
 * import { ZilliqaLogo } from 'components/about-page-container';
 * <ZilliqaLogo />
 * <ZilliqaLogo css="height: 10px;"/>
 * <ZilliqaLogo src="/overridden/img.png"/>
 */
export const ZilliqaLogo = styled(Img)`
  position: fixed;
  top: 50px;
  right: 100px;

  width: 50px;
  height: auto;

  @media (max-width: 321px) {
    width: 30px;
    height: 60px;
    right: 10px;
  }
  @media (max-width: 640px) {
    right: 20px;
    width: 30px;
    height: 60px;
  }
`;
/**
 * Illustration for about page.
 * @prop css - Any css code.
 * @example
 * import { Illustration } from 'components/about-page-container';
 * <Illustration src={`/imgs/illustration-1.${browserState.format}`}/>
 */
export const Illustration = styled(Img)`
  width: 43vw;
  height: 43vw;

  @media (max-width: 640px) {
    width: 60vw;
    height: 60vw;
  }
`;
/**
 * Title container for InfoContainer.
 * @prop css - Any css code.
 * @example
 * import { TitleText, InfoContainer } from 'components/about-page-container';
 * <InfoContainer>
 *   <TitleText>
 *     This is title.
 *   </TitleText>
 * </InfoContainer>
 */
export const TitleText = styled(Text)`
  font-size: 50px;

  @media (max-width: 650px) {
    text-align: center;
    font-size: 30px;
  }
`;
/**
 *  Description container for InfoContainer.
 * @prop css - Any css code.
 * @example
 * import { DescriptionText, InfoContainer } from 'components/about-page-container';
 * <InfoContainer>
 *   <DescriptionText>
 *     This is any description.
 *   </DescriptionText>
 * </InfoContainer>
 */
export const DescriptionText = styled(Text)`
  @media (max-width: 650px) {
    text-align: center;
    font-size: 15px;
  }
`;

ZilliqaLogo.defaultProps = {
  src: '/icons/zilliqa-logo.svg'
};
