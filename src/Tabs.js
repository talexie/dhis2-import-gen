import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Link } from 'react-router-dom';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});

export const CenteredTabs=({ options, variant, orientation,centered,onChange })=>{
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (_event, newValue) => {
    setValue(newValue);
    onChange(_event,newValue);
  };
  return (
    <Paper className={classes.root}>
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
    </Paper>
  );
}
export default CenteredTabs;