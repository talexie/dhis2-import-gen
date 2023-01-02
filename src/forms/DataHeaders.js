import React from 'react';
import { Button, Grid, Paper } from '@material-ui/core';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { TextInput } from './TextField';
import { makeStyles } from '@material-ui/core/styles';
import { TableList } from './TableList';

const useStyles = makeStyles(
    {
        stepContent:{
            marginTop: '32px',
            width: '100%',
            marginBottom: '32px',
        },
        root:{
            minWidth: '30%',
            paddingTop: '8px',
            paddingBottom: '8px'
        }
    },

);
export const DataHeaders =(props)=>{
    const { label,getData,data } = props;
    const classes = useStyles();
    const [tableData,setTableData] = React.useState(data?.['headers']??[]);
    const [groupings, setGroupings] = React.useState({
        active: "true",
        order: "",
        name: "",
        field: "",
        row: 1,
        spanFields:""
      });
      const handleChange = (event) => {
        setGroupings({ 
            ...groupings, 
            [event.target.name]: event.target.value 
        });
      };
      const { active,order,field,name,row,spanFields } = groupings;
      const addItem =(_ev)=>{
          _ev.preventDefault();
          const mergedTableData = [...new Set([...tableData,...[groupings]])];
          setTableData(mergedTableData);
          setGroupings({
            active: "true",
            order: "",
            field: "",
            name: "",
            row: 1,
            spanFields: ""
          });
          getData({
              headers: mergedTableData
          }); 
      }
    return(
        <Paper className ={classes.stepContent } elevation={ 0 }>
        <Grid>
            <Grid item>
                <TableList rows= { tableData??[] } title={ label} />
            </Grid>
        <form noValidate autoComplete="off">
            <Grid item>
                <TextInput
                    label={ 'Field Name'}
                    data={ field }
                    onChange={handleChange}
                    id = { "field"}
                />
            </Grid>
            <Grid item>
                <TextInput
                    label={ 'Header Name'}
                    data={ name }
                    onChange={handleChange}
                    id = { "name"}
                />
            </Grid>
            <Grid item>
                <TextInput
                    label={ 'Order'}
                    data={ order }
                    onChange={ handleChange }
                    id = { "order" }
                />
            </Grid>
            <Grid item>
                <TextInput
                    label={ 'Row Number'}
                    data={ row }
                    onChange={ handleChange }
                    id = { "row" }
                />
            </Grid>
            <Grid item>
                <TextInput
                    label={ 'Span Columns'}
                    data={ spanFields }
                    onChange={ handleChange }
                    id = { "spanFields" }
                    helperText= "Enter fields separated by comma e.g value,name"
                />
            </Grid>
            <Grid item>
                <FormControl component="fieldset" className ={ classes.root }>
                    <FormLabel component="legend">Active</FormLabel>
                    <RadioGroup row aria-label="active" name="active" value={active?"true":"false"} onChange={ handleChange}>
                    <FormControlLabel value={ "true" } control={<Radio />} label="Yes" />
                    <FormControlLabel value={ "false" } control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>
            </Grid>
            <Button  size="medium" variant="outlined" color="primary" onClick ={ addItem } >Add</Button>
        </form>
        </Grid>
        </Paper>
    );
}