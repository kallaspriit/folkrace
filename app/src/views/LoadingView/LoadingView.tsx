import classNames from "classnames";
import React from "react";
import { FlexProps } from "../../components/Flex/Flex";
import { Loading } from "../../components/Loading/Loading";
import { View } from "../../components/View/View";
import styles from "./LoadingView.module.scss";

export const LoadingView: React.FC<FlexProps> = React.memo(function LoadingView({ className, ...rest }) {
  return (
    <View center className={classNames(styles["loading-view"], className)} {...rest}>
      <Loading large />
    </View>
  );
});
