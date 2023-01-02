import React from 'react';
import { Button, Grid, Paper } from '@material-ui/core';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { TextInput } from './TextField';
import { enumOptions, dataGroupTypes } from './Helpers';
import { makeStyles } from '@material-ui/core/styles';
import { TableList } from './TableList';
import { useConfig } from '@dhis2/app-runtime';

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
export const DataGroupings =(props)=>{
    const { label,getData,data } = props;
    const classes = useStyles();
    const { baseUrl } = useConfig();
    const [loading,setLoading] = React.useState(true);
    const [tableData,setTableData] = React.useState(data?.['dataGroups']??[]);
    const [dtype,setDType] = React.useState(`indicatorGroups?fields=id,name,code&paging=false`);
    const [meta,setMeta] = React.useState('INDICATOR_GROUP');
    const [dhisData,setDhisData] = React.useState([]);
    const [groupings, setGroupings] = React.useState({
        active: true,
        type: "",
        name: "",
        description: "",
        id: "",
      });
      const handleChange = (event) => {
        if(event.target.name === 'id'){
            const selectedOption = dhisData?.find((d)=>d?.id === event?.target?.value);
            setGroupings({
                ...groupings,
                ...selectedOption
            });
        }
        else if(event.target.value === 'DATA_ELEMENT_GROUP'){
            setDType(`dataElementGroups?fields=id,name,code&paging=false`);
            setMeta(event.target.value);
            setGroupings({ 
                ...groupings, 
                [event.target.name]: event.target.value 
            });
        }
        else if(event.target.value === 'INDICATOR_GROUP'){
            setDType(`indicatorGroups?fields=id,name,code&paging=false`);
            setMeta(event.target.value);
            setGroupings({ 
                ...groupings, 
                [event.target.name]: event.target.value 
            });
        }
        else{
            setDType(`indicatorGroups?fields=id,name,code&paging=false`);
            setMeta('INDICATOR_GROUP');
            setGroupings({ 
                ...groupings, 
                [event.target.name]: event.target.value 
            });
        }
      };
      const { active,type,description,id,name } = groupings;
      const addItem =(_ev)=>{
          _ev.preventDefault();
          const mergedTableData = [...new Set([...tableData,...[groupings]])];
          setTableData(mergedTableData);
          setGroupings({
            active: true,
            type: "",
            name: "",
            description: "",
            id: "",
          });
          getData({
              dataGroups: mergedTableData
          }); 
      }
      React.useEffect(()=> {
        let unmounted = false;
        const getGroupings= async()=> {
            const response = await fetch(`${baseUrl}/api/${dtype}`);
            const dhis2data = await response.json();
            if(meta === 'DATA_ELEMENT_GROUP'){
                setDhisData(dhis2data?.dataElementGroups);
            }
            else if(meta === 'INDICATOR_GROUP'){
                setDhisData(dhis2data?.indicatorGroups);
            }
            else{
                setDhisData(dhis2data?.indicatorGroups);
            }  
            setLoading(false);  
        }
        getGroupings();
        return () => {
            unmounted = true;
        };        
      },[meta,dtype,baseUrl]);
    return(
        <Paper className ={classes.stepContent } elevation={ 0 }>
        <Grid>
            <Grid item>
                <TableList rows= { tableData??[] } title={ label} />
            </Grid>
        <form noValidate autoComplete="off">
            <Grid item>
                <TextInput
                    label={ 'Data Group Type'}
                    select ={  true }
                    data={ type }
                    onChange={handleChange}
                    id = { "type"}
                    options = { enumOptions(dataGroupTypes)}
                />
            </Grid>
            <Grid item>
                <TextInput
                    label={ 'Select Group'}
                    select ={  true }
                    data={ id }
                    onChange={ handleChange }
                    disabled = { loading }
                    id = { "id" }
                    options = { enumOptions(dhisData,'name','id')}
                />
            </Grid>
            <Grid item>
                <TextInput
                    label={ 'Name'}
                    readOnly =  { true }
                    data={ name }
                    id = { "name" }
                    name = { "name"}
                />
            </Grid>
            <Grid item>
                <TextInput
                    label={ 'Description'}
                    data={ description }
                    onChange={handleChange}
                    id = { "description"}
                />
            </Grid>
            <Grid item>
                <FormControl component="fieldset" className ={ classes.root }>
                    <FormLabel component="legend">Active</FormLabel>
                    <RadioGroup row aria-label="active" name="active" value={ active } onChange={ handleChange}>
                    <FormControlLabel value={ true } control={<Radio />} label="Yes" />
                    <FormControlLabel value={ false } control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>
            </Grid>
            <Button  size="medium" variant="outlined" color="primary" onClick ={ addItem } >Add</Button>
        </form>
        </Grid>
        </Paper>
    );
}