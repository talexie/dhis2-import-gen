import React from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import { DisplayTable } from './DisplayTable';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/styles';
import { createMoreColumns } from "./Utils";

const useStyles = makeStyles({
    root: {
        marginTop: 0,
        marginLeft: 20
    }
});
/**
 * dimension: ['pe:LAST_MONTH','FSptXcFjcvi:fgbdgqWcsAB;LEk48SLXafR','dGlXlgOZKm3:nvHR2VyWnuj;PcdIlcKn0f4;y8uclXNUv5e;WnPIBcUzZ3o;FVqENkrcDjc;fQ85I0gRoUF;HQDUxMAdYzS;h6JBfbddseR;pyXuDCRzvJx;PvhXL1PXIwc;FGDAfB9NAi4;nmnTJAAwyc5','ou:LEVEL-6;P70tgOUu4Fk','dx:x49YBDQ9XYo;IzMXFccsgDQ;fjWNhvFGiNr;bqCwwR573r7;c9vu0hR3k8L;WnaqkjVv1R6;uxzYsIHurUu'],
 */

const tsDataStore = {
    tsDataStore:{
        resource: 'dataStore/frs/zm'
    }
}

export const ManageOrgUnitMapping = () => {    
    const classes = useStyles();
    const [tableData,setTableData] = React.useState({ data:[],columns:[]});
    const { error } = useDataQuery(tsDataStore,{
        onComplete: (data)=>{
            const keys = ['dhis2Id','dhis2Code','dhis2Name','datimId','datimCode','datimName','zpctCode','zpctName'];
            const cols = createMoreColumns([],keys);
            setTableData({ data: data.tsDataStore , columns: cols });
                        
        },
        onError:(dataError)=>{
            console.log("data Error",dataError)
        }
    });
    //const showDisplay = !loading && !error
    return (
        <Grid container className={ classes.root } direction= { 'column' } >
            <Grid item>
                <h3>DATIM/Echo Location Mappings</h3>
            </Grid>            
            <Grid item>
                { error && <span>{ `ERROR: ${error.message}` }</span>}
            
                <DisplayTable title = { 'Mapping' } columns= { tableData.columns } data = { tableData.data } />
            
            </Grid>
        </Grid>
    )
}

