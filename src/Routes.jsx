import React, { useEffect, useState } from 'react';
import { routes } from './App';
import { NavTabs } from './ui';
import { Container, Stack, Divider, Unstable_Grid2 as Grid } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { css } from '@emotion/react';
import { getUserGroup, hasAccessToRoute, hasUserGroup, useCurrentUser, UserContext } from './utils';
import { CircularLoader } from '@dhis2/ui';
import { useConfig } from '@dhis2/app-runtime';
import AppAdapter from '@dhis2/app-adapter';




const sidebar = css({
  width: '14em',
  height: '100%',
  flexGrow: 0,
  a: {
      textDecoration: 'none'
  }
});
const wrapper = css({
  overflow: 'hidden',
  width: '99%'
})

const content =css({
  borderLeft: '1px solid #E8EDF2',
});

const loader =css({
  margin: '20%'
});

const getInjectedBaseUrl = () => {
  const baseUrl = document
      .querySelector('meta[name="dhis2-base-url"]')
      ?.getAttribute('content')
  if (baseUrl && baseUrl !== '__DHIS2_BASE_URL__') {
      return baseUrl
  }
  return null
}


const isPlugin = process.env.REACT_APP_DHIS2_APP_PLUGIN === 'true'

const appConfig = {
  url: getInjectedBaseUrl() || process.env.REACT_APP_DHIS2_BASE_URL,
  appName: process.env.REACT_APP_DHIS2_APP_NAME || '',
  appVersion: process.env.REACT_APP_DHIS2_APP_VERSION || '',
  apiVersion: parseInt(process.env.REACT_APP_DHIS2_API_VERSION),
  pwaEnabled: process.env.REACT_APP_DHIS2_APP_PWA_ENABLED === 'true',
  plugin: isPlugin,
  loginApp: process.env.REACT_APP_DHIS2_APP_LOGINAPP === 'true',
  direction: process.env.REACT_APP_DHIS2_APP_DIRECTION,
}


export const AppRoutes = () => {
  const { data, loading } = useCurrentUser();
  const { appName } = useConfig();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(()=>{
    if(getUserGroup(data?.userGroups,'MANAGE_DATIM_ADMIN') && !loading){
      setIsAdmin(true);
    }
    else{
      setIsAdmin(false);
    }
  },[data,loading,navigate])

  if(loading){
    return (
      <AppAdapter 
        {...appConfig}
        url = { "../../.." }
        appName={ appName }
      >
        <Container >
          <CircularLoader css={ loader} />
        </Container>
      </AppAdapter>
    )
  }
  else{
    const links = isAdmin?routes[0]?.children:routes[0]?.children?.filter((r)=>getUserGroup(data?.userGroups,r?.userGroup));
    return (
      <AppAdapter 
        {...appConfig}
        url = { "../../.." }
        appName={ appName }
        css={ wrapper }
      >
        <UserContext.Provider value={ {
          user: data,
          isAdmin: isAdmin,
          canResubmit: getUserGroup(data?.userGroups,'ZM_SMARTCARE_ADMIN' ),
          hasAccess: hasAccessToRoute(data?.userGroups,routes[0]?.children),
          restricted: hasUserGroup(data?.userGroups,'RESTRICTED_APP_ACCESS' )
        }}>
            <Grid 
              container
              direction={'row'}
              useFlexGap
              sx={{ 
                flexWrap: 'wrap',
                justifyContent: "flex-start",
                alignItems: "baseline",
              }}
              spacing={2}
            >
              <Grid xs={12} sm={2} md={2}>
                <NavTabs
                  options= { links }
                />
              </Grid>
              <Grid xs={12} sm={10} md={10} css={ content }>
                <Container>
                    <Outlet />
                </Container>
              </Grid>
            </Grid>
        </UserContext.Provider>
      </AppAdapter>
    );
  }
  
};

export default AppRoutes;

