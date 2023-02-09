import * as React from 'react';
import { css } from '@emotion/react';
import { FileInputField, Button } from '@dhis2/ui';
import { Container, Stack } from '@mui/material';
import { useState } from 'react';
import { useOrgUnit,PeriodField, OrgUnitControl } from '../ui';
import sortBy from 'lodash/sortBy';
import { generatePeriods, periodTypes } from '../utils';


const classes={
    root: css({
        marginTop: 0,
        marginLeft: 20
    })
};
export const ManageMer = () => {   
    
    const [open, setOpen ] = useState(false);
    
    const [periodType, setPeriodType ] = React.useState(undefined);
    const [period, setPeriod ] = React.useState(undefined);
    const [periods, setPeriods ] = React.useState([]);
    const [selected, setSelected ] = React.useState([]);
    const { organisationUnitId, handleOrganisationUnitChange} = useOrgUnit();


    const onChangePeriodType=({selected})=>{
        setPeriodType(selected)
        const generatedPeriods = generatePeriods(selected);
        setPeriods(generatedPeriods);
    }
    const onChangePeriod=({ selected })=>{
        setPeriod(selected);  
    }
    const getOrgUnit =(value)=>{
        setSelected(value);
    }
    const upload=()=>{
        /*return getUpdate({ 
            period: period, 
            orgUnit: selected?.id,
            submitted:  true
        });*/
        // Process data
    }
    const handleOpen =(_e)=>{
        setOpen(true);
    }
    const handleClose =(_e)=>{
        setOpen(false);
    }
    const onChange =(fileObject,_e)=>{
        const { name, files } = fileObject;
        console.log("files:",files);
    }
    return (
        <Container css={ classes.root }>
            <Stack spacing= {2}>
            <Item>
                <h3>SMARTCare Upload</h3>
            </Item> 
            <Item>
                <div>
                    <Button css = { classes.label } onClick={ handleOpen }>
                        <span>Select Organisation Unit</span>
                    </Button>
                    <span css={classes.selected}> { selected?.label || selected?.displayName }</span>
                    {
                        open?(
                            <div  css= { classes.orgUnit }>                                                    
                                <OrgUnitControl                      
                                    getSelected = { getOrgUnit }
                                    multiSelect = { false }
                                    onChange={handleOrganisationUnitChange}
                                    open = { open }
                                    handleClose = { handleClose }
                                />
                            </div>
                                    
                        ): null
                    }
                </div>     
            </Item>
            <Item>
                <PeriodField
                    data ={ sortBy(periodTypes,'label') }
                    placeholder= { `Select Period Type` }
                    onChange = { onChangePeriodType }
                    selected = { periodType }
                    input = { periodType }
                    
                />
            </Item>
            <Item>
                <PeriodField      
                    data ={ sortBy(periods,"value") }
                    placeholder= { `Select Period` }
                    onChange = { onChangePeriod }
                    selected = { period }
                    multi = { true }
                />
            </Item>            
            <Item>         
                <FileInputField
                    helpText="Please submit EXCEL report file from SMARTCARE"
                    label="Upload SMARTCARE Report"
                    name="uploadName"
                    required= { true}
                    onChange={onChange}
                />         
            </Item>
            <Item>
                <Button
                    name="Button"
                    onClick={ upload }
                    type="button"
                    value="default"
                >
                    Submit
                </Button>
            </Item>
            </Stack>
        </Container>
    )
}

export default ManageIndicatorMapping;
