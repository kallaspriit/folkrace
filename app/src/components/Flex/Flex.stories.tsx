import { withKnobs, boolean } from "@storybook/addon-knobs";
import React from "react";
import { ReactComponent as AppleIcon } from "../../theme/icons/apple-icon.svg";
import { MockText } from "../MockText/MockText";
import { P } from "../Paragraph/Paragraph";
import { Flex } from "./Flex";

export default {
  title: "Flex",
  component: Flex,
  decorators: [withKnobs],
};

export const Default = () => (
  <Flex debug>
    <div>First child</div>
    <div>Second child</div>
    <AppleIcon style={{ width: "32px" }} />
  </Flex>
);

export const WithSecondary = () => (
  <Flex debug secondary={boolean("Secondary", true)}>
    <div>Seondary uses secondary text color</div>
    <a href="https://google.com">Link child</a>
    <AppleIcon style={{ width: "32px" }} />
  </Flex>
);

export const WithAlternate = () => (
  <Flex debug alternate={boolean("Alternate", true)}>
    <div>Alternate uses the other font</div>
    <a href="https://google.com">Link child</a>
    <AppleIcon style={{ width: "32px" }} />
  </Flex>
);

export const WithColumn = () => (
  <Flex column debug>
    <div>First child</div>
    <div>Second child</div>
  </Flex>
);

export const WithRow = () => (
  <Flex row debug>
    <div>First child</div>
    <div>Second child</div>
  </Flex>
);

export const WithInline = () => (
  <Flex inline debug>
    <div>First child</div>
    <div>Second child</div>
  </Flex>
);

export const WithExpanded = () => (
  <Flex row debug style={{ width: "400px" }}>
    <Flex expanded debug>
      First
    </Flex>
    <Flex debug>Second</Flex>
    <Flex expanded debug>
      Third
    </Flex>
  </Flex>
);

export const WithoutShrinkable = () => (
  <Flex column scrollable debug style={{ height: "400px" }}>
    <Flex debug style={{ flexBasis: "250px" }}>
      Row
    </Flex>
    <Flex debug style={{ flexBasis: "250px" }}>
      Row
    </Flex>
    <Flex debug style={{ flexBasis: "250px" }}>
      Row
    </Flex>
  </Flex>
);

export const WithShrinkable = () => (
  <Flex column scrollable debug style={{ height: "400px" }}>
    <Flex debug shrinkable style={{ flexBasis: "250px" }}>
      Row
    </Flex>
    <Flex debug shrinkable style={{ flexBasis: "250px" }}>
      Row
    </Flex>
    <Flex debug shrinkable style={{ flexBasis: "250px" }}>
      Row
    </Flex>
  </Flex>
);

export const WithPadded = () => (
  <Flex padded debug>
    <P>
      Content is padded by <em>$layout-view-padding</em>
    </P>
  </Flex>
);

export const WithPaddedHorizontal = () => (
  <Flex paddedHorizontal debug>
    <P>
      Content is horizontally padded by <em>$layout-view-padding</em>
    </P>
  </Flex>
);

export const WithPaddedVertical = () => (
  <Flex paddedVertical debug>
    <P>
      Content is vertically padded by <em>$layout-view-padding</em>
    </P>
  </Flex>
);

export const WithPaddedCompact = () => (
  <Flex padded compact debug>
    <P>
      Content is padded by <em>$layout-view-padding</em>
    </P>
  </Flex>
);

export const WithPaddedHorizontalCompact = () => (
  <Flex paddedHorizontal compact debug>
    <P>
      Content is horizontally padded by <em>$layout-view-padding</em>
    </P>
  </Flex>
);

export const WithPaddedVerticalCompact = () => (
  <Flex paddedVertical compact debug>
    <P>
      Content is vertically padded by <em>$layout-view-padding</em>
    </P>
  </Flex>
);

export const WithLimited = () => (
  <Flex limited debug>
    This rather long content is width is limited to $layout-limited-width after which it has to wrap
  </Flex>
);

export const WithScrollable = () => (
  <Flex scrollable padded limited debug style={{ maxHeight: "300px" }}>
    <MockText />
  </Flex>
);

export const WithCenter = () => (
  <Flex center debug style={{ width: "400px" }}>
    Content is centered
  </Flex>
);

export const WithCover = () => (
  <Flex cover debug>
    Container is 100% width/height
  </Flex>
);

export const WithLighter = () => (
  <Flex lighter debug>
    Makes the text lighter using $color-text-lighter
  </Flex>
);

export const WithDarker = () => (
  <Flex darker debug>
    Makes the text darker using $color-text-darker
  </Flex>
);

export const WithDebug = () => <Flex debug>Draws a red background and outline around the container</Flex>;

export const WithDebug2 = () => <Flex debug2>Draws a green background and outline around the container</Flex>;

export const WithDebug3 = () => <Flex debug3>Draws a blue background and outline around the container</Flex>;

export const WithAxisAlignment = () => (
  <Flex row debug mainAxisAlignment="center" crossAxisAlignment="flex-end" style={{ height: "300px" }}>
    mainAxisAlignment=&quot;center&quot; crossAxisAlignment=&quot;flex-end&quot;
  </Flex>
);

export const WithFlex = () => (
  <Flex row debug>
    <Flex flex={1} debug>
      flex={1}
    </Flex>
    <Flex flex={2} debug>
      flex={2}
    </Flex>
    <Flex flex={3} debug>
      flex={3}
    </Flex>
  </Flex>
);
