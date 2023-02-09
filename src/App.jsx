import React from 'react';
import { AppRoutes } from './Routes';
import {
    AnalyticsListTable as DataExport
  } from './analytics';
  import {
    ManageIndicatorMapping,
    ManageMer,
    ManageOrgUnitMapping
  } from './mappings';
  import { Setup } from './manage';
import {
    createHashRouter,
    RouterProvider,
  } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
    QueryClient,
    QueryClientProvider,
  } from 'react-query';
import { theme } from '@dhis2/ui'
import { PageError } from './PageError';

  
const defaultQueryFn = async ({ queryKey }) => {
    const response = await fetch(`../../${queryKey}`);
    if (!response.ok) {
        throw new Error('Network response was not ok')
    }
    return response.json();
};
const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: defaultQueryFn,
      },
    },
});
export const routes = [
    {
      path: "/",
      element: <AppRoutes/> ,
      errorElement: <PageError/>,
      children: [
        {
          label: "Data Export",
          path: "/export",
          index: true,
          element: <DataExport />
        },
        {
          label: "Indicator Mapping",
          path: "/imapping",
          element: <ManageIndicatorMapping/>
        },
        {
          label: "Location Mapping",
          path: "/lmapping",
          element: <ManageOrgUnitMapping /> 
        },
        {
          label: "Setup",
          path: "/setup",
          element: <Setup/>
        },
        {
          label: "SMARTCARE",
          path: "/upload",
          element: <ManageMer/>,
          userGroup: "SMARTCARE_UPLOAD"
        }
      ]
    }
  ]
const router = createHashRouter(routes);
  
const App = () => {
    return (
       
      <ThemeProvider theme={createTheme(theme)}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>          
      </ThemeProvider>
    );
}

export default App
