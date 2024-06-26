import React, { useEffect, useState } from 'react';
import { routes } from './App';
import { NavTabs } from './ui';
import { Container } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { css } from '@emotion/react';
import { getUserGroup, hasAccessToRoute, hasUserGroup, useCurrentUser, UserContext } from './utils';
import { CircularLoader } from '@dhis2/ui';


const sidebar = css({
  width: '14em',
  height: '100%',
  flexGrow: 0,
  a: {
      textDecoration: 'none'
  }
});

const content =css({
  borderLeft: '1px solid #E8EDF2',
  paddingLeft: '3em',
  paddingRight: '3em',
  paddingTop: '1.2em',
  flexGrow: 1
});
const root =css({
  minWidth: '600px',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%'
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
              css={sidebar}
            />
            <Container css={content}>
                <Outlet />
            </Container>
        </div>
      </UserContext.Provider>
    );
  }
  
};

export default AppRoutes;
