import styled from 'styled-components';

export const AroundedContainer = styled.form`
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-direction: column;

  background-color: #5c63efb3;
  height: 400px;
  width: 300px;
  border-radius: 30px;

  margin-left: 10%;
  padding-top: 70px;
  padding-bottom: 70px;

  transition: all 1s ease-out;

  @media (max-width: 400px) {
    margin: 0;
  }
`;
