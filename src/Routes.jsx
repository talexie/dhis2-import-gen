import React, { useEffect, useState } from 'react';
import { routes } from './App';
import { NavTabs } from './ui';
import { Container } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { css } from '@emotion/react';
import { getUserGroup, hasAccessToRoute, hasUserGroup, useCurrentUser, UserContext } from './utils';
import { CircularLoader, Divider } from '@dhis2/ui';

const root =css({
  minWidth: '600px'
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
      <div css ={ root }>
        <Container >
           <CircularLoader css={ loader} />
        </Container>
    </div>
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
        <div css ={ root }>
          <NavTabs
            options= { links }
          />
          <Divider/>
          <Container>
              <Outlet />
          </Container>
        </div>
      </UserContext.Provider>
    );
  }
  
};

export default AppRoutes;
