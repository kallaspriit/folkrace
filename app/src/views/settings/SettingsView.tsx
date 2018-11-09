import * as React from "react";

const SettingsView: React.SFC<{}> = () => <div className="view view--text settings-view">
  <button onClick={() => window.location.href = "http://kallaspriit"}>Open http://kallaspriit</button>
</div>;

export default SettingsView;
