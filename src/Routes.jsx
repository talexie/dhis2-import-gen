import React, { useEffect, useState } from 'react';
import { routes } from './App2';
import { NavTabs } from './ui';
import { Container, Unstable_Grid2 as Grid } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { css } from '@emotion/react';
import { getUserGroup, hasAccessToRoute, hasUserGroup, useCurrentUser, UserContext } from './utils';
import { CircularLoader } from '@dhis2/ui';

const content =css({
  borderLeft: '1px solid #E8EDF2',
});

const loader =css({
  margin: '20%'
});




export const AppRoutes = () => {
  const { data, loading } = useCurrentUser();
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
        <Container >
          <CircularLoader css={ loader} />
        </Container>
    )
  }
  else{
    const links = isAdmin?routes[0]?.children:routes[0]?.children?.filter((r)=>getUserGroup(data?.userGroups,r?.userGroup));
    return (
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
    );
  }
  
};

export default AppRoutes;

