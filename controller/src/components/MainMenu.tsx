import * as React from "react";
import { Link } from "react-router-dom";

export const MainMenu: React.StatelessComponent<{}> = () => (
  <ul className="main-menu">
    <li>
      <Link to="/status">Status</Link>
    </li>
    <li>
      <Link to="/map">Map</Link>
    </li>
    <li>
      <Link to="/remote">Remote</Link>
    </li>
    <li>
      <Link to="/ai">AI</Link>
    </li>
    <li>
      <Link to="/camera">Camera</Link>
    </li>
  </ul>
);
