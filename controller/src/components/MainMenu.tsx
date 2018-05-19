import * as React from "react";
import { Link } from "react-router-dom";

export const MainMenu: React.StatelessComponent<{}> = () => (
  <ul className="main-menu">
    <li>
      <Link to="/remote">Remote</Link>{" "}
    </li>
    <li>
      <Link to="/lidar">Lidar</Link>{" "}
    </li>
    <li>
      <Link to="/status">Status</Link>{" "}
    </li>
  </ul>
);
