import React from 'react';
import styled from 'styled-components';

import { Text } from 'components/text';

import { FontSize, Fonts, FontColors } from 'config';

const DropdownContent = styled.div`
  cursor: pointer;
  user-select: none;
`;
const DropdownList = styled.ul`
  position: absolute;
  list-style-type: none;
  margin: 0;
  padding: 0;
  transform: translate(0,-10%);
  border-radius: .3rem;
  border: 1px solid #e9ecef;
  background-color: ${FontColors.white};
  color: ${FontColors.black};
  z-index: 5;
`;
const Dropdownitem = styled.li`
  cursor: pointer;
  user-select: none;

  border-bottom: 1px solid ${FontColors.white};
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: .3rem;

  :hover {
    background-color: #e9ecef;
  }
`;
const DropdownCloser = styled.a`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 4;
`;

type Prop = {
  items: string[];
  onClick: (item: string) => void;
};

export const Dropdown: React.FC<Prop> = ({
  items,
  children,
  onClick
}) => {
  const [isMenu, setIsMenu] = React.useState(false);
  const hanldeClick = React.useCallback(() => {
    setIsMenu(!isMenu);
  }, [setIsMenu, isMenu]);

  return (
    <DropdownContent onClick={hanldeClick}>
      {children}
      <DropdownList style={{ display: isMenu ? 'block' : 'none' }}>
        {items.map((item) => (
          <Dropdownitem
            key={item}
            onClick={() => onClick(item)}
          >
            <Text
              size={FontSize.sm}
              fontVariant={Fonts.AvenirNextLTProBold}
              css="margin: 0;"
              nowrap
            >
              {item}
            </Text>
          </Dropdownitem>
        ))}
      </DropdownList>
      <DropdownCloser
        style={{ display: isMenu ? 'block' : 'none' }}
        onClick={hanldeClick}
      />
    </DropdownContent>
  );
};
