import React from "react";
import { Switch, Route, useHistory } from "react-router-dom";
import { List, ListItem } from "../List/List";
import { TitleBar, OnBackCallback } from "../TitleBar/TitleBar";
import { View } from "../View/View";

export interface Page {
  name: string;
  title: string;
  page: React.ReactNode;
  trailing?: React.ReactNode;
}

export interface PageListProps {
  title: string;
  pages: Page[];
  onBack: OnBackCallback;
  buildPagePath: (page: Page, preserveOptional: boolean) => string;
}

export const PageList: React.FC<PageListProps> = ({ title, pages, onBack, buildPagePath }) => {
  const history = useHistory();

  return (
    <Switch>
      {pages.map((page) => (
        <Route key={page.name} path={buildPagePath(page, false)}>
          {page.page}
        </Route>
      ))}
      <Route>
        <View>
          <TitleBar onBack={onBack} title={title} />
          <List scrollable expanded>
            {pages.map((page) => (
              <ListItem
                key={page.name}
                trailing={page.trailing}
                onClick={() => history.push(buildPagePath(page, true))}
              >
                {page.title}
              </ListItem>
            ))}
          </List>
        </View>
      </Route>
    </Switch>
  );
};
