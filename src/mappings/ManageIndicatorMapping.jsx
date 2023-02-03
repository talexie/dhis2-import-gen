import React from 'react';
import { GridTable } from '../ui';
import Grid from '@mui/material/Grid';
import { css } from '@emotion/react';
import { createMoreColumns } from "../utils";
import { useQuery } from 'react-query';
import { CircularLoader } from '@dhis2/ui';
//import i18n from '@dhis2/d2-i18n';

const classes={
    root: css({
        marginTop: 0,
        marginLeft: 20
    })
};
/**
 * dimension: ['pe:LAST_MONTH','FSptXcFjcvi:fgbdgqWcsAB;LEk48SLXafR','dGlXlgOZKm3:nvHR2VyWnuj;PcdIlcKn0f4;y8uclXNUv5e;WnPIBcUzZ3o;FVqENkrcDjc;fQ85I0gRoUF;HQDUxMAdYzS;h6JBfbddseR;pyXuDCRzvJx;PvhXL1PXIwc;FGDAfB9NAi4;nmnTJAAwyc5','ou:LEVEL-6;P70tgOUu4Fk','dx:x49YBDQ9XYo;IzMXFccsgDQ;fjWNhvFGiNr;bqCwwR573r7;c9vu0hR3k8L;WnaqkjVv1R6;uxzYsIHurUu'],
 */

const tsDataStore = ['dataStore/terminology/mappings'];
export const ManageIndicatorMapping = () => {    
    const { data,isLoading,error } = useQuery(tsDataStore);
    const keys = ['datimCode','datimUid','sex','ageGroup','datimXyz','hivStat','datimDisaggregationUid','datimDisaggregation','echoIndicatorUid','echoIndicatorName','echoSexUid','echoAgeGroupUid','lessThan15AndAbove15Uid','defaultUid'];
    const columns = createMoreColumns(['id'],keys);
    //const showDisplay = !loading && !error
    return (
        <Grid container css={ classes.root } direction= { 'column' } >
            <Grid item>
                <h3>DATIM/Echo Indicator Mappings</h3>
            </Grid>            
            <Grid item>
                { error && <span>{ `ERROR: ${error.message}` }</span>}
            
                {
                    isLoading?(
                        <CircularLoader large/>
                    ):
                    (
                        <GridTable 
                            title = { 'Mapping' } 
                            columns= { columns??[] } 
                            data = { data??[] } 
                            loading = { isLoading }
                            generateId = { 'datimUid' }
                        />
                    )
                }             
            
            </Grid>
        </Grid>
    )
}

export default ManageIndicatorMapping;
