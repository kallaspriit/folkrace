import * as React from "react";
import { NavLink } from "react-router-dom";
import "./MainMenu.scss";

const MainMenu: React.SFC<{}> = () => (
  <div className="main-menu">
    <ul className="main-menu__nav">
      <li>
        <NavLink to="/status" activeClassName="active">
          <div className="main-menu__nav__icon">
            <i className="icon icon__status" />
          </div>
          <div className="main-menu__nav__text">Status</div>
        </NavLink>
      </li>
      <li>
        <NavLink to="/map" activeClassName="active">
          <div className="main-menu__nav__icon">
            <i className="icon icon__map" />
          </div>
          <div className="main-menu__nav__text">Map</div>
        </NavLink>
      </li>
      <li>
        <NavLink to="/ai" activeClassName="active">
          <div className="main-menu__nav__icon">
            <i className="icon icon__ai" />
          </div>
          <div className="main-menu__nav__text">AI</div>
        </NavLink>
      </li>
      <li>
        <NavLink to="/remote" activeClassName="active">
          <div className="main-menu__nav__icon">
            <i className="icon icon__remote" />
          </div>
          <div className="main-menu__nav__text">Remote</div>
        </NavLink>
      </li>
      <li>
        <NavLink to="/settings" activeClassName="active">
          <div className="main-menu__nav__icon">
            <i className="icon icon__settings" />
          </div>
          <div className="main-menu__nav__text">Settings</div>
        </NavLink>
      </li>
    </ul>
  </div>
);

export default MainMenu;
