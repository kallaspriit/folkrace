/**
 * These route name and params definitions are declared in a separate file to be able to build type safe
 * paths and url's while enabling code splitting so respective declarations do not need to be imported from
 * the components that we want to split into separate bundles.
 */

// configure connection view
export const CONFIGURE_CONNECTION_VIEW_PATH = "/configure-connection";

// main menu view
export const MAIN_MENU_VIEW_PATH = "/main/:menu?/:page?/:modifier?";

export type MainMenuViewMenu = "status" | "map" | "controller" | "remote" | "settings";

export interface MainMenuViewParams {
  menu?: MainMenuViewMenu;
  page?: string;
  modifier?: string;
}
