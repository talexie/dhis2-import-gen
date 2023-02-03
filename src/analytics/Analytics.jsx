import * as React from 'react';
import {  useQuery} from 'react-query';
import { AnalyticsHeader } from './AnalyticsHeader';
import { AnalyticsList } from './AnalyticsList';
import { Container, Stack } from '@mui/material';
import { CircularLoader } from '@dhis2/ui';
import { css } from '@emotion/react';
import { merge } from 'lodash';
//import i18n from '@dhis2/d2-i18n';

const classes = {
    loader: css({
        marginTop: '100px',
        marginLeft: '240px'
    })
}
const tsDataStore = ['dataStore/frs/zm'];
const dataStore = ['dataStore/terminology/mappings'];
const configDataStore = ['dataStore/terminology/config'];

/**
 * Component to Generate Data Import Table
 */
export const AnalyticsListTable = (props) => {    
    const [selectedParam, setSelectedParam] = React.useState(undefined);
    const { data: allLevels,isLoading } = useQuery([`organisationUnitLevels?paging=false&fields=level,name`],{ refetchOnWindowFocus: false });
    const { data:ds,isLoading: loaded } = useQuery({
        queryKey: dataStore,
        refetchOnWindowFocus: false
    });
    const {data:ts,isLoading: tsLoaded} = useQuery(tsDataStore,{  refetchOnWindowFocus: false });
    const {data:config, isLoading: configLoaded} = useQuery(configDataStore, {  refetchOnWindowFocus: false });
    
    const getData=(ev)=>{
        setSelectedParam(ev);       
    }
    return (
        <Container>
            <Stack direction={'column'}>
                <AnalyticsHeader
                    getUpdate = { getData }
                    config = { config }
                />  
                {
                    !loaded && !tsLoaded && !configLoaded && !isLoading?(
                        <AnalyticsList 
                            selected = { merge(selectedParam,{
                                levels: allLevels?.organisationUnitLevels??[]
                            })}
                            config = { config }
                            ts = { ts }
                            ds = { ds }
                        />
                    ):(
                        <CircularLoader large  css={ classes.loader} />
                    )     
                } 
            </Stack>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
        </Container>
        
           
    )
}

