import React from 'react';
import { Grid, Paper } from '@mui/material';
import { TextInput } from './TextField'
import { css } from '@emotion/react';

const classes=
    {
        stepContent: css({
            width: '100%',
            marginBottom: '32px',
        }),
        root: css({
            minWidth: '30%',
            paddingTop: '8px',
            paddingBottom: '8px'
        })
    }

export const ReportTypes =(props)=>{
    const { getData,data } = props;
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
        <Paper css={ classes.stepContent} elevation = {0}>
          <Grid css={ classes.stepContent}>
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