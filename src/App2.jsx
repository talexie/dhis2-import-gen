import React from 'react';
import { AppRoutes } from './Routes';
import {
    AnalyticsListTable as DataExport
  } from './analytics';
  import {
    DownloadART,
    ImportAggregateData,
    ManageART,
    ManageIndicatorMapping,
    ManageMappings,
    ManageMer,
    ManageOrgUnitMapping
  } from './mappings';
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
import { Home } from './ui';

  
export const defaultQueryFn = async ({ queryKey }) => {
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
      element: <AppRoutes/> ,
      errorElement: <PageError/>,
      children: [
        {
          path: "/",
          element: <Home/>,
          label: "Home"
        },
        {
          label: "Data Export",
          path: "export",
          element: <DataExport />,
          userGroup: "MANAGE_DATIM_ADMIN" 
        },
        {
          label: "Indicator Mapping",
          path: "imapping",
          element: <ManageIndicatorMapping/>,
          userGroup: "MANAGE_DATIM_ADMIN" 
        },
        {
          label: "Location Mapping",
          path: "lmapping",
          element: <ManageOrgUnitMapping />,
          userGroup: "MANAGE_DATIM_ADMIN" 
        },
        {
          label: "Upload Mapping",
          path: "uploadmapping",
          element: <ManageMappings />,
          userGroup: "MANAGE_DATIM_ADMIN" 
        },
        {
          label: "Download ART Register",
          path: "downloadart",
          element: <DownloadART />,
          userGroup: "MANAGE_DATIM_ADMIN" 
        },
        {
          label: "SMARTCARE",
          path: "upload",
          element: <ManageMer/>
        },
        {
          label: "Upload ART Register",
          path: "artupload",
          element: <ManageART/>
        },
        {
          label: "HMIS Data Import",
          path: "dataimport",
          element: <ImportAggregateData/>,
          userGroup: "RESTRICTED_APP_ACCESS" 
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
