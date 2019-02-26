import { darken } from "polished";
import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

import { BotIcon, MapIcon, RemoteIcon, SettingsIcon, StatusIcon } from "./Icon";
import { Text } from "./Text";

const Wrap = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  background-color: #000;
`;

const Items = styled.ul`
  display: flex;
  flex-direction: row;
  height: ${props => props.theme.size.menuHeight};
  flex: 1;
  max-width: 600px;
`;

const Item = styled.li`
  height: 100%;
  text-align: center;
  font-variant: small-caps;
  text-transform: uppercase;
  font-size: 0.8em;
  flex: 1;
`;

const Link = styled(NavLink)`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-decoration: none;
  color: ${props => darken(props.theme.size.darkerLighterPercentage, props.theme.text.primary)};
  background-color: rgba(0, 0, 0, 0);
  transition: background-color 300ms;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  &.active-main-menu-item {
    background-color: ${props => props.theme.bg.secondary};
    color: ${props => props.theme.text.primary};
  }
`;

const Label = styled(Text)`
  padding-top: 4px;
`;

export const MainMenu: React.SFC<{}> = () => (
  <Wrap>
    <Items>
      <Item>
        <Link to="/status" activeClassName="active-main-menu-item">
          <StatusIcon />
          <Label>Status</Label>
        </Link>
      </Item>
      <Item>
        <Link to="/map" activeClassName="active-main-menu-item">
          <MapIcon />
          <Label>Map</Label>
        </Link>
      </Item>
      <Item>
        <Link to="/simulation" activeClassName="active-main-menu-item">
          <BotIcon />
          <Label>Simulation</Label>
        </Link>
      </Item>
      <Item>
        <Link to="/remote" activeClassName="active-main-menu-item">
          <RemoteIcon />
          <Label>Remote</Label>
        </Link>
      </Item>
      <Item>
        <Link to="/settings" activeClassName="active-main-menu-item">
          <SettingsIcon />
          <Label>Settings</Label>
        </Link>
      </Item>
    </Items>
  </Wrap>
);
