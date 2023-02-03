import React from 'react';
import { routes } from './App';
import { CenteredTabs } from './ui';
import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { css } from '@emotion/react';

const root =css({
  minWidth: '600px'
});

export const AppRoutes = ( props ) => {
  const [value, setValue] = React.useState(0);
  const handleChange = (_event, newValue) => {
      setValue(newValue);
  };
  return (
    <div css ={ root }>
      <CenteredTabs
       options= { routes[0]?.children }
       onChange = { handleChange }
       v={ value }
      />
      <Container>
          <Outlet />
      </Container>
    </div>
  );
};

export default AppRoutes;
