import { action } from "@storybook/addon-actions";
import React from "react";
import { ReactComponent as SettingsIcon } from "../../theme/icons/settings-icon.svg";
import { P } from "../Paragraph/Paragraph";
import { View } from "../View/View";
import { List, ListItem, ListTitle } from "./List";

export default {
  title: "List",
  component: List,
};

export const Default = () => (
  <List>
    <ListItem>Full Statistics</ListItem>
  </List>
);

export const MoreThanOneChild = () => (
  <List>
    {[1, 2, 3, 4].map((data, key) => (
      <ListItem key={key}>
        <P>Full statistics {data}</P>
      </ListItem>
    ))}
  </List>
);

export const WithTitle = () => (
  <View>
    <ListTitle>First list</ListTitle>
    <List>
      {[1, 2, 3, 4].map((data, key) => (
        <ListItem key={key}>
          <P>Row {data}</P>
        </ListItem>
      ))}
    </List>

    <ListTitle>Second list</ListTitle>
    <List>
      {[1, 2, 3, 4].map((data, key) => (
        <ListItem key={key}>
          <P>Row {data}</P>
        </ListItem>
      ))}
    </List>
  </View>
);

export const WithDynamicChildren = () => (
  <List>
    <ListItem>
      <P large darker>
        Full Statistics
      </P>
    </ListItem>
  </List>
);

export const WithCallback = () => (
  <List>
    <ListItem onClick={action("clicked full statistics")}>
      <P>Full Statistics</P>
    </ListItem>
  </List>
);

export const WithLeading = () => (
  <List>
    <ListItem leading={<SettingsIcon />}>
      <P>Full Statistics</P>
    </ListItem>
  </List>
);

export const WithTrailingText = () => (
  <List>
    <ListItem trailing={<P>English</P>}>
      <P>Language</P>
    </ListItem>
  </List>
);

export const WithTrailingIcon = () => (
  <List>
    <ListItem trailing={<SettingsIcon />}>
      <P>Language</P>
    </ListItem>
  </List>
);

export const WithoutTrailing = () => (
  <List>
    <ListItem removeTrailing>
      <P>Language</P>
    </ListItem>
  </List>
);
