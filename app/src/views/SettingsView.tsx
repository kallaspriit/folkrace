import React from "react";

import { View } from "../components/View";

export const SettingsView: React.SFC<{}> = () => <View text>
  <button onClick={() => window.location.href = "http://kallaspriit"}>Open http://kallaspriit</button>
</View>;
