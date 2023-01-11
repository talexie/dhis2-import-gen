import React from 'react'
import { OrgUnitTree } from './ouTree';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { PeriodField } from './forms/PeriodField';
import { Button } from '@dhis2/ui';
import sortBy from 'lodash/sortBy';
import { generatePeriods, periodTypes } from './Period';

//import i18n from '@dhis2/d2-i18n';

const useStyles = makeStyles({
    root: {
        marginTop: 0,
        marginLeft: 20
    },
    orgUnit: {      
      marginLeft: 20
    }
});


/**
 * Component to Generate Data Import Table
 */
export const AnalyticsHeader = ({ getUpdate,config }) => {    
    const classes = useStyles();
    const [periodType, setPeriodType ] = React.useState(undefined);
    const [period, setPeriod ] = React.useState([]);
    const [periods, setPeriods ] = React.useState([]);
    const [selected, setSelected ] = React.useState([]);
    const [dimension, setDimension ] = React.useState([]);
    const [selectedDim, setSelectedDim ] = React.useState([]);
    const [report, setReport ] = React.useState([]);
    const [selectedReport, setSelectedReport] = React.useState([]);
    const dimensions =config?.dimensions?.map((d)=>{
        const dim ={};
        dim.label =d?.name;
        dim.key = d?.key;
        dim.value =d?.key;
        return {
            ...dim,
            dimension:d
        }
    });
    const reports =config?.reports?.map((d)=>{
        return {
            ...d,
            label:d?.name,
            key: d?.key,
            value: d?.key,
        }
    });
    //const mechanisms = remapData(config?.mechanisms,'mechanism','name','id')
    const onChangePeriodType=(event)=>{
        setPeriodType(t=>event.selected)
        const generatedPeriods = generatePeriods(event.selected);
        setPeriods(generatedPeriods);
    }
    const onChangePeriod=(event)=>{
        setPeriod(t=>event.selected)
    }
    const getOrgUnit =(value)=>{
        setSelected(value)
    }
    const onChangeDimension=(event)=>{
        const selectedDimension = dimensions?.find((dx)=>dx?.key === event.selected);
        setDimension(t=>selectedDimension);
        setSelectedDim(t=>event.selected);
    }
    const onChangeReport = (event)=>{
        const selectedReport = reports?.find((dx)=>dx?.key === event.selected);
        setReport(t=>selectedReport);
        setSelectedReport(t=>event.selected);
    }
    const update=()=>{
        return getUpdate({ 
            period: period, 
            orgUnit: selected,
            dimensions:dimension,
            report: report
        });
    }
    return (
        <Grid container className={ classes.root } direction= { 'column' } spacing={ 2 }>
            <Grid item xs>
                <h3>DATIM Import File Generator</h3>
            </Grid>            
            <Grid item xs container justifyContent={ 'flex-start' } spacing={ 8 } className={ classes.orgUnit }>
                <Grid item xs>
                    <OrgUnitTree                      
                      getSelected = { getOrgUnit }
                      multiSelect = { false }
                    />
                </Grid>
                <Grid item xs container justifyContent={ 'flex-start' } spacing={ 2 }>
                        <Grid item xs>
                            <PeriodField
                                data ={ sortBy(periodTypes,'label') }
                                placeholder= { `Select Period Type` }
                                onChange = { onChangePeriodType }
                                selected = { periodType }
                                singleSelect = { true }
                                input = { periodType }
                                
                            />
                        </Grid>
                        <Grid item xs>
                            <PeriodField
                                className = { classes.orgUnit }
                                data ={ sortBy(periods,"value") }
                                placeholder= { `Select Period` }
                                onChange = { onChangePeriod }
                                selected = { period }
                            />
                        </Grid>
                </Grid>
                <Grid item xs>
                    <PeriodField
                        className = { classes.orgUnit }
                        data ={ sortBy(dimensions,'name') }
                        placeholder= { `Select Dimensions` }
                        onChange = { onChangeDimension }
                        selected = { selectedDim}
                        singleSelect = { true }
                    />
                </Grid>
                <Grid item xs>
                    <PeriodField
                        className = { classes.orgUnit }
                        data ={ sortBy(reports,'name') }
                        placeholder= { `Select Report` }
                        onChange = { onChangeReport }
                        selected = { selectedReport}
                        singleSelect = { true }
                    />
                </Grid>
                <Grid item xs>
                    <Button
                        dataTest="dhis2-uicore-button"
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
}

