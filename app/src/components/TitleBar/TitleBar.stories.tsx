import { action } from "@storybook/addon-actions";
import React from "react";
import { ReactComponent as DownloadIcon } from "../../theme/icons/download-icon.svg";
import { ReactComponent as Favouriteicon } from "../../theme/icons/favourite-icon.svg";
import { ReactComponent as ShareIcon } from "../../theme/icons/share-icon.svg";
import { IconButton } from "../IconButton/IconButton";
import { TitleBar } from "./TitleBar";

export default {
  title: "TitleBar",
  component: TitleBar,
};

export const WithTitle = () => <TitleBar title="Hello" />;

export const WithTransparentAndTitle = () => <TitleBar transparent title="Hello" />;

export const WithBackHandler = () => <TitleBar onBack={action("clicked back button")} />;

export const WithTitleAndBackHandler = () => <TitleBar title="Hello" onBack={action("clicked back button")} />;

export const WithFixed = () => (
  <div style={{ overflow: "auto", height: "400px" }}>
    <TitleBar fixed transparent title="Hello" />
    <div style={{ height: "2000px" }}>scrollig content</div>
  </div>
);

export const WithSecondary = () => (
  <div style={{ overflow: "auto", height: "400px" }}>
    <TitleBar fixed secondary title="Hello" />
    <div style={{ height: "2000px" }}>scrollig content</div>
  </div>
);

export const WithIconButtons = () => (
  <TitleBar mainAxisAlignment="flex-end" onBack={action("clicked back button")}>
    <IconButton secondary icon={<ShareIcon />}>
      Share
    </IconButton>
    <IconButton secondary icon={<DownloadIcon />}>
      Download
    </IconButton>
    <IconButton secondary icon={<Favouriteicon />}>
      Favourite
    </IconButton>
  </TitleBar>
);
