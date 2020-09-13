import React from "react";
import { BlockButton } from "../BlockButton/BlockButton";
import { Container } from "../Container/Container";
import { P } from "../Paragraph/Paragraph";
import { View } from "./View";

export default {
  title: "View",
  component: View,
};

export const Default = () => <View debug>Content</View>;

export const WithPadded = () => (
  <View padded debug>
    Content
  </View>
);

export const WithPaddedAndLimited = () => (
  <View padded limited debug>
    <P debug>Content</P>
  </View>
);

export const WithContentAndFooter = () => (
  <View>
    <Container limited padded expanded scrollable>
      Content
    </Container>
    <Container limited padded>
      <BlockButton>Footer</BlockButton>
    </Container>
  </View>
);
