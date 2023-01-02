import React from 'react';
import { Grid, Paper } from '@material-ui/core';
import { TextInput } from './TextField'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(
    {
        stepContent:{
            width: '100%',
            marginBottom: '32px',
        },
        root:{
            minWidth: '30%',
            paddingTop: '8px',
            paddingBottom: '8px'
        }
    }
);

export const ReportTypes =(props)=>{
    const { getData,data } = props;
    const classes = useStyles();
    const [reports, setReports] = React.useState(data);
    const handleChange = (event) => {
      let mergedReports = { 
        ...reports, 
        [event.target.name]: event.target.value 
      } 
      setReports(mergedReports);
      getData(mergedReports);
    };
    const { 
      name
    } = reports;
    return(
        <Paper className ={ classes.stepContent} elevation = {0}>
          <Grid className ={ classes.stepContent}>
            <form noValidate autoComplete="off">
              <Grid item>
                <TextInput
                  label={ 'Name'}
                  data={ name }
                  onChange={ handleChange }
                  id = { "name"}
                  name = { "name"}
                />
              </Grid>
            </form>
          </Grid>
        </Paper>
    );
}