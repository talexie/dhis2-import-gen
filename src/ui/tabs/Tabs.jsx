import React from 'react';
import { css } from '@emotion/react';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Link } from 'react-router-dom';

const classes={
  root:  css({
    flexGrow: 1,
  }),
};

export const CenteredTabs=({ options, variant, orientation,centered,onChange,children })=>{

  const [value, setValue] = React.useState(0);
  const handleChange = (_event, newValue) => {
    setValue(newValue);
    onChange(_event,newValue);
  };
  return (
    <Paper css={classes.root}>
      <Tabs
        value={ value }
        onChange={ handleChange }
        indicatorColor="primary"
        textColor="primary"
        centered = { centered?? true}
        orientation={ orientation??'horizontal'}
        variant={ variant?? 'standard'}
      > 
      { 
        options.map( (option,i) =>{
            return(
                <Tab 
                    label={ option.label }
                    to={ option?.path }
                    component= { Link }
                    key = { `route-${option?.path}-${option.label}-${i}` }
                />
            )
        })
      }
      </Tabs>
      { children }
    </Paper>
  );
}
export default CenteredTabs;