import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';

import {
  AnalyticsListTable as DataExport
} from './Analytics';
import {
  ManageIndicatorMapping
} from './ManageIndicatorMapping';
import {
  ManageOrgUnitMapping
} from './ManageOrgUnitMapping';
import { Setup } from './Setup';
import CenteredTabs from './Tabs';

const routes = [
  {
    label: "Data Export",
    path: "/export"
  },
  {
    label: "Indicator Mapping",
    path: "/imapping"
  },
  {
    label: "Location Mapping",
    path: "/lmapping"
  },
  {
    label: "Setup",
    path: "/setup"
  }
]
export const Routes = ( props ) => {
  const [value, setValue] = React.useState(0);
  const handleChange = (_event, newValue) => {
      setValue(newValue);
  };
  return (
    <div>
      <CenteredTabs
       options= { routes }
       onChange = { handleChange }
       v={ value }
      />
      <Switch>
        <Redirect
          exact
          from="/"
          to="/export"
        />
        <Route path="/export">
          <DataExport />
        </Route>
        <Route path="/imapping">
          <ManageIndicatorMapping />
        </Route>
        <Route path="/lmapping">
          <ManageOrgUnitMapping />
        </Route>
        <Route path="/setup">
          <Setup/>
        </Route>
      </Switch>
    </div>
  );
};

export default Routes;
