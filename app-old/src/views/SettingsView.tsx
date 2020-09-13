import React from "react";

import { View } from "../components/View";

export const SettingsView: React.SFC<{}> = () => (
  <View text>
    <p>
      <button onClick={() => (window.location.href = "http://kallaspriit")}>
        Open http://kallaspriit
      </button>
    </p>
    <p>
      <button onClick={() => (window.location.href = "http://lab")}>
        Open http://lab
      </button>
    </p>
  </View>
);
