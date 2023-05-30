import React, { useState } from 'react';
import { useMemo } from 'react';
import { useOrgUnit,PeriodField, OrgUnitControl } from '../ui';
import Grid from '@mui/material/Unstable_Grid2';
import { css } from '@emotion/react';
import { Button } from '@dhis2/ui';
import sortBy from 'lodash/sortBy';
import { useQuery } from 'react-query';
import { generatePeriods, periodTypes } from '../utils';



//import i18n from '@dhis2/d2-i18n';

const classes = {
    root: css({
        marginTop: '16px',
    }),
    orgUnit: css({      
      position: 'relative',
      width: '300px'

    }),
    label: css({
        textAlign:'left',
        marginBottom: '4px'
    }),
    selected: css({
        backgroundColor: '#bdcebd'
    }),
    wrapper: css({
        minWidth: '168px'
    }),
    grid: css({
        paddingRight: '16px'
    })
};

/**
 * Component to Generate Data Import Table
 */
export const AnalyticsHeader = React.memo(({ getUpdate,config }) => { 
    const [open, setOpen ] = useState(false);
    
    const [periodType, setPeriodType ] = React.useState(undefined);
    const [period, setPeriod ] = React.useState(undefined);
    const [periods, setPeriods ] = React.useState([]);
    const [selected, setSelected ] = React.useState([]);
    const [orgUnitGroup, setOrgUnitGroup] = React.useState([]);
    const [dimension, setDimension ] = React.useState([]);
    const [selectedDim, setSelectedDim ] = React.useState([]);
    const [report, setReport ] = React.useState([]);
    const [selectedReport, setSelectedReport] = React.useState([]);
    const { organisationUnitId, handleOrganisationUnitChange} = useOrgUnit();
    const { data: organisationUnitGroups } = useQuery([`organisationUnitGroups?paging=false&fields=id,name,code`],{ refetchOnWindowFocus: false });
    const dimensions =useMemo(()=>config?.dimensions?.map((d)=>{
        const dim ={};
        dim.label =d?.name;
        dim.key = d?.key;
        dim.value =d?.key;
        return {
            ...dim,
            dimension:d
        }
    }),[config?.dimensions]);
    const reports =useMemo(()=>config?.reports?.map((d)=>{
        return {
            ...d,
            label:d?.name,
            key: d?.key,
            value: d?.key,
        }
    }),[config?.reports]);
    const ougs = useMemo(()=>organisationUnitGroups?.organisationUnitGroups?.map((d)=>{
        return {
            ...d,
            label:d?.name,
            key: d?.id,
            value: d?.id,
        }
    }),[organisationUnitGroups?.organisationUnitGroups]);
    //const mechanisms = remapData(config?.mechanisms,'mechanism','name','id')
    const onChangePeriodType=({selected})=>{
        setPeriod(undefined);
        setPeriodType(selected);        
        const generatedPeriods = generatePeriods(selected);
        setPeriods(generatedPeriods);
    }
    const onChangePeriod=({ selected })=>{
        setPeriod(selected);  
    }
    const getOrgUnit =(value)=>{
        setSelected(value);
    }
    const getOrgUnitGroup =({ selected })=>{
        setOrgUnitGroup(selected)
    }
    const onChangeDimension=({selected })=>{
        const selectedDimension = dimensions?.find((dx)=>dx?.key === selected);
        setDimension(selectedDimension);
        setSelectedDim(selected);
    }
    const onChangeReport = ({selected })=>{
        const selectedReport = reports?.find((dx)=>dx?.key === selected);
        setReport(selectedReport);
        setSelectedReport(selected);
    }
    const update=()=>{
        return getUpdate({ 
            period: period, 
            orgUnit: selected?.id,
            level: selected?.level,
            dimensions:dimension,
            report: report,
            orgUnitGroup: orgUnitGroup,
            submitted:  true
        });
    }
    const handleOpen =(_e)=>{
        setOpen(true);
    }
    const handleClose =(_e)=>{
        setOpen(false);
    }
    return (
            <Grid sx={{ mt:2 }} container alignItems="flex-start" direction= { 'column' } spacing={ 2 }>
                <Grid>
                    <h3>DATIM Import File Generator</h3>
                </Grid>            
                <Grid container spacing={ 4 } alignItems="flex-start" >
                    <Grid xs css = { classes.grid } container spacing={ 2 } direction="column" alignItems="flex-start">
                        <Grid xs css = { classes.wrapper }>
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
                                                enableSelectionLevel ={ false }
                                            />
                                        </div>
                                              
                                    ): null
                                }
                            </div>                                                  
                        </Grid>
                        <Grid xs css = { classes.wrapper }>
                            <PeriodField
                                data ={ sortBy(ougs,'label') }
                                placeholder= { `Select Organisation Unit Groups` }
                                onChange = { getOrgUnitGroup }
                                selected = { orgUnitGroup }
                                multi = { true }
                                
                            />
                        </Grid>
                    </Grid>
                    <Grid xs css = { classes.grid } container  spacing={ 2 } alignItems="flex-start" direction="column">
                        <Grid xs css = { classes.wrapper }>
                            <PeriodField
                                data ={ sortBy(periodTypes,'label') }
                                placeholder= { `Select Period Type` }
                                onChange = { onChangePeriodType }
                                selected = { periodType }
                                input = { periodType }
                                
                            />
                        </Grid>
                        <Grid xs css = { classes.wrapper }>
                            <PeriodField
                                
                                data ={ sortBy(periods,"value") }
                                placeholder= { `Select Period` }
                                onChange = { onChangePeriod }
                                selected = { period }
                                multi = { true }
                            />
                        </Grid>
                    </Grid>
                    <Grid xs css = { classes.wrapper }>
                        <PeriodField
                            data ={ sortBy(dimensions,'name') }
                            placeholder= { `Select Dimensions` }
                            onChange = { onChangeDimension }
                            selected = { selectedDim}
                        />
                    </Grid>
                    <Grid xs css = { classes.wrapper }>
                        <PeriodField
                            data ={ sortBy(reports,'name') }
                            placeholder= { `Select Report` }
                            onChange = { onChangeReport }
                            selected = { selectedReport}
                        />
                    </Grid>
                    <Grid xs>
                        <Button
                            name="Button"
                            onClick={ update }
                            type="button"
                            value="default"
                        >
                            Update
                        </Button>
                    </Grid>           
                </Grid>
            </Grid>
    )
});

