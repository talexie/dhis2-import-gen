import React from 'react';
import { AppRoutes } from './Routes';
import {
    AnalyticsListTable as DataExport
  } from './analytics';
  import {
    ManageART,
    ManageIndicatorMapping,
    ManageMappings,
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
      element: <AppRoutes/> ,
      errorElement: <PageError/>,
      children: [
        {
          path: "/",
          element: <ManageMer/>
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
          label: "SMARTCARE",
          path: "upload",
          element: <ManageMer/>
        },
        {
          label: "ART Register",
          path: "artupload",
          element: <ManageART/>
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
