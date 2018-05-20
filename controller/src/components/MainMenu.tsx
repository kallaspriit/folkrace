import * as React from "react";
import { NavLink } from "react-router-dom";

const MainMenu: React.SFC<{}> = () => (
  <ul className="main-menu">
    <li>
      <NavLink to="/status" activeClassName="active">
        <div className="main-menu--icon">
          <i className="icon icon__status" />
        </div>
        <div className="main-menu--text">Status</div>
      </NavLink>
    </li>
    <li>
      <NavLink to="/map" activeClassName="active">
        <div className="main-menu--icon">
          <i className="icon icon__map" />
        </div>
        <div className="main-menu--text">Map</div>
      </NavLink>
    </li>
    <li>
      <NavLink to="/remote" activeClassName="active">
        <div className="main-menu--icon">
          <i className="icon icon__remote" />
        </div>
        <div className="main-menu--text">Remote</div>
      </NavLink>
    </li>
    <li>
      <NavLink to="/ai" activeClassName="active">
        <div className="main-menu--icon">
          <i className="icon icon__ai" />
        </div>
        <div className="main-menu--text">AI</div>
      </NavLink>
    </li>
    <li>
      <NavLink to="/settings" activeClassName="active">
        <div className="main-menu--icon">
          <i className="icon icon__settings" />
        </div>
        <div className="main-menu--text">Settings</div>
      </NavLink>
    </li>
  </ul>
);

export default MainMenu;
