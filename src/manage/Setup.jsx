import React from 'react'
import Grid from '@mui/material/Grid';
import { css } from '@emotion/react';
import { useConfig } from '@dhis2/app-runtime';
import { TabPanel, GridTable,CenteredTabs } from '../ui';
import { getTableColumns,createMoreColumns  } from '../utils';
import { useQuery } from 'react-query';

const classes = {
    root: css({
        marginTop: 0,
        marginLeft: 20
    }),
    title:css({
        fontSize:14,
        backgroundColor: '#fff999'
    }),
    tableHeader:css({
        backgroundColor: 'rgb(18 20 22 / 29%)'
    })

  };

const tabs =[
    {
        "label": "Report Types",
        "key": "reportTypes",
        "path" : "/setup/reporttypes"
    },
    {
        "label": "Reports",
        "key": "reports",
        "path" : "/setup/reports"
    }
]

export const Setup = () => {    
    const { baseUrl } = useConfig();
    const { data,error } = useQuery([`${baseUrl}/api/dataStore/terminology/config`]);
    const [value, setValue] = React.useState(0);
    const [label, setLabel] = React.useState('reportTypes');
    const [setupData,setSetupData] = React.useState({ data:[],columns:[]});
    //const [d, setD] = React.useState([]);

    const handleChange = (_event, newValue) => {
        setValue(newValue);  
        const title = tabs?.find((_t,i)=> i === newValue );
        setLabel(title?.key); 
    };
    React.useEffect(()=>{
        const columns = createMoreColumns([],getTableColumns(data?.[label]));
        if(data){
          setSetupData({ data: data?.[label] , columns: columns });
        }       
    },[label,data]);
    return (
        !error?
        (
            <Grid container spacing={2} css={ classes.root } direction= { 'column' } >
                <Grid item>
                    <h3>Configure Mapping Settings</h3>
                </Grid>            
                <Grid item container direction="row" spacing={1} alignItems="flex-start">
                    <Grid item xs={12} sm={12} md={5} lg={2} xl={2}>
                        <CenteredTabs 
                            orientation="vertical" 
                            options={ tabs }
                            onChange = { handleChange }
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={9} xl={9}>
                        <TabPanel value={value} index={ value }>
                            <GridTable 
                                actionsAllowed ={ true} 
                                title = { label } 
                                columns= { setupData?.columns } 
                                data = { setupData?.data } 
                                config = { data }
                                pageSize= {10}
                            />
                        </TabPanel>
                    </Grid>
                                                 
                </Grid>
            </Grid>
        ):(
            <Grid container css={ classes.root } direction= { 'column' } >
                <Grid item>
                    <h3>Configure Mapping Settings</h3>
                </Grid>            
                <Grid item>
                    <span>{ `ERROR: ${error}` }</span>
                </Grid>
            </Grid>
        )
    )
}

export default Setup;
