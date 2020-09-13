/**
 * These route name and params definitions are declared in a separate file to be able to build type safe
 * paths and url's while enabling code splitting so respective declarations do not need to be imported from
 * the components that we want to split into separate bundles.
 */

// dashboard view
export const DASHBOARD_VIEW_PATH = "/dashboard";

// experiments view
export const EXPERIMENTS_VIEW_PATH = "/experiments/:experiment?/:page?/:modifier?";

export interface ExperimentsViewParams {
  experiment?: string;
  page?: string;
  modifier?: string;
}
