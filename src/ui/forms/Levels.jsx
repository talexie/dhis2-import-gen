import React from 'react';
import { Button, Grid, Paper } from '@mui/material';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { TextInput } from './TextField';
import { enumOptions } from '../../utils';
import { css } from '@emotion/react';
import { TableList } from './TableList';
import { useConfig } from '@dhis2/app-runtime';

const classes=
    {
        stepContent: css({
            marginTop: '32px',
            width: '100%',
            marginBottom: '32px',
        }),
        root: css({
            minWidth: '30%',
            paddingTop: '8px',
            paddingBottom: '8px'
        })
    };
export const Levels =(props)=>{
    const { label,getData,data } = props;
    const { baseUrl } = useConfig();
    const [loading,setLoading] = React.useState(true);
    const [tableData,setTableData] = React.useState(data?.['levels']??[]);
    const [dhisData,setDhisData] = React.useState([]);
    const [groupings, setGroupings] = React.useState({
        active: "true",
        name: "",
        level: "",
        id: "",
    });
    const handleChange = async(event) => {
        if(event.target.name === 'id'){
            const selectedOption = dhisData?.find((d)=>d?.id === event?.target?.value);
            setGroupings({
                ...groupings,
                ...selectedOption
            });
        }
        else{
            setGroupings({ 
                ...groupings, 
                [event.target.name]: event.target.value 
            });
        }
    };
    const { active,id,level,name } = groupings;
    const addItem =(_ev)=>{
        _ev.preventDefault();
        const mergedTableData = [...new Set([...tableData,...[groupings]])]
        setTableData(mergedTableData);
        setGroupings({
            active: "true",
            level: "",
            name: "",
            id: "",
        });
        getData({
            levels: mergedTableData
        }); 
    }
    React.useEffect(()=>{
        let unmounted = false;
        const getLevels= async()=> {
            const response = await fetch(`${baseUrl}/api/organisationUnitLevels?fields=id,name,level&paging=false`);
            const dhis2data = await response.json();
            setDhisData(dhis2data?.organisationUnitLevels); 
            setLoading(false);  
        }
        getLevels();
        return () => {
            unmounted = true;
        };  
    },[baseUrl]);
    return(
        <Paper css={classes.stepContent } elevation={ 0 }>
            <Grid>
                <Grid item>
                    <TableList rows= { tableData??[] } title={ label} />
                </Grid>
                <form noValidate autoComplete="off">
                    <Grid item>
                        <TextInput
                            label={ 'ID'}
                            select ={  true }
                            data={ id }
                            onChange={ handleChange }
                            disabled = { loading }
                            id = { "id"}
                            options = { enumOptions(dhisData,'name','id')}
                        />
                    </Grid>
                    <Grid item>
                        <TextInput
                            label={ 'Name'}
                            data={ name }
                            readOnly =  { true }
                            id = { "name"}
                        />
                    </Grid>
                    <Grid item>
                        <TextInput
                            label={ 'Level'}
                            data={ level}
                            readOnly =  { true }
                            id = { "level"}
                        />
                    </Grid>
                    <Grid item>
                        <FormControl component="fieldset" css={ classes.root }>
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