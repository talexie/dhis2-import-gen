import React from 'react'

import { makeStyles } from '@material-ui/styles';
import { useDataQuery } from '@dhis2/app-runtime'
import { AnalyticsHeader } from './AnalyticsHeader';
import { AnalyticsList } from './AnalyticsList';

const useStyles = makeStyles({
    root: {
        marginTop: 0,
        marginLeft: 20
    },
    orgUnit: {      
      marginLeft: 20
    }
});
const dataStore = {
    dataStore:{
        resource: 'dataStore/frs/zm'
    }
}
const tsDataStore = {
    dataStore:{
        resource: 'dataStore/terminology/mappings'
    }
}
const configDataStore = {
    dataStore:{
        resource: 'dataStore/terminology/config'
    }
}

/**
 * Component to Generate Data Import Table
 */
export const AnalyticsListTable = (props) => {    
    const classes = useStyles();
    const [selectedParam, setSelectedParam] = React.useState([]);
    const [location, setLocation] = React.useState([]);
    const [mapping,setMapping] = React.useState([]);
    const [metadata, setMetadata] = React.useState([]);
    const {data:ds} = useDataQuery(dataStore);
    const {data:ts} = useDataQuery(tsDataStore);
    const {data:config} = useDataQuery(configDataStore);

    const getData=(ev)=>{
        setSelectedParam(ev);       
    }
    React.useEffect(()=>{
        if(ds && ts && config){
            setMetadata(config.dataStore);
            setMapping(ts.dataStore);
            setLocation(ds.dataStore);
        }        
    },[ds,ts,config])
    return (
        <div className= {classes.root}>
            <AnalyticsHeader
                getUpdate = { getData }
                config = { metadata }
            />   
            <AnalyticsList 
              selected = { [ selectedParam] }
              config = { metadata }
              ts = { location }
              ds = { mapping }
            />                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
        </div>
        
           
    )
}

