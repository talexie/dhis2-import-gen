import React, { useCallback, useEffect, useState } from 'react';
import { useMemo } from 'react';
import { useQueries } from 'react-query';
import { GridTable } from '../ui';
import isEmpty from 'lodash/isEmpty';
//import { defaultQueryFn } from './App';
import { 
    getCategoryDimensions,
    useMergeDhis2AnalyticsData
} from '../utils';
import chunk from 'lodash/chunk';
import queryString from 'query-string';
import {createWorkerFactory, useWorker} from '@shopify/react-web-worker';
import { Container } from '@mui/system';
//import { useWorker } from 'react-hooks-worker';

const createWorker = createWorkerFactory(() => import('../Worker'));
/**
 * Get filter mechanisms UIDs
 * @param {*} report 
 * @returns 
 */
const getFilterMechanism =(report)=>{
    if(report?.category?.id && report?.categoryOption ){
        return `${report?.category?.id}:${report?.categoryOption}`;
    }
    else{
        return '';
    }
}


/**
 * Create parallel fetch calls
 */
export const fetcher = (...urls) => {
    const f = url => fetch(url).then(r => r.json())
    return Promise.all(urls.map(url => f(url)))
}

/**
 * Component to Generate Data Import Table
 */
export const AnalyticsData = React.memo(({ ts,indicators,mapping,selected,config }) => { 
    const { submitted } = selected;
    const worker = useWorker(createWorker);
    const [message, setMessage] = React.useState(null);   
    const [clicked, setClicked] = useState(false);
    const { period:pe, dimensions, orgUnit:ou, report, orgUnitGroup, levels } = selected || {}; 
    const hierarchy = JSON.stringify(levels); 
    const dimension = dimensions?.dimension;
    const dim= getCategoryDimensions(dimension?.items);  
    const filterMechanism = getFilterMechanism(report);
    const mechanism = report?.mechanism; 
    const catOptionFilter = isEmpty(dim)?[]:dim;
    const qsQuery =(q)=>{
        if(ou){
            return queryString.stringify({
                dimension:[
                    `pe:${pe?.join(';')}`,
                    `ou:LEVEL-6-${ou}`,
                    `dx:${ q?.join(';')}`
                ].concat(catOptionFilter),
                filter: filterMechanism,
                displayProperty:`NAME`,
                hierarchyMeta:true,
                showHierarchy:true,
                hideEmptyRows:true,
                hideEmptyColumns:true
            },{ 
                indices: false,
                skipNulls: true 
            }); 
        }
        else {
            return queryString.stringify({
                dimension:[
                    `pe:${pe?.join(';')}`,
                    `ou:OU_GROUP-${orgUnitGroup}`,
                    `dx:${ q?.join(';')}`
                ].concat(catOptionFilter),
                filter: filterMechanism,
                displayProperty:`NAME`,
                hierarchyMeta:true,
                showHierarchy:true,
                hideEmptyRows:true,
                hideEmptyColumns:true
            },{ 
                indices: false,
                skipNulls: true 
            }); 
        }
    }

    const chunkQuery =(q)=>((!isEmpty(pe) && !isEmpty(q) && ou) || (!isEmpty(pe) && !isEmpty(q) && orgUnitGroup))?`analytics.json?${qsQuery(q)}`:false;   
    const chunkedIndicators = chunk(indicators??[],config?.chunks??15)??[];
    const urls = chunkedIndicators.map((chunkedInd)=>chunkQuery(chunkedInd)).filter(Boolean).filter(String);
    const userQueries = useQueries(urls?.map((chunked) => {
            return {
                queryKey: [chunked],
                enabled: (chunked !== false),
                refetchOnWindowFocus: false,
            }
        }),
    );
    const { loading, data } = useMergeDhis2AnalyticsData(userQueries);
    const fetchData = useCallback(()=>{
        if(!loading){
            return worker.getDataTable(
               {
                  ts: ts,
                  data: data,
                  mapping: mapping,
                  hierarchy: hierarchy,
                  mechanism: mechanism,
                  key: dimension?.key
              }
            ).then((webWorkerMessage)=>{
                setMessage(JSON.parse(webWorkerMessage));
                if(!(webWorkerMessage?.loading)){
                    setClicked(false); 
                    return; 
                }
                else{
                    setClicked(submitted); 
                    return;
                }                
            })
            
        }
        else{
            setClicked(false);
            setMessage(null);
            return;
        }
    },[hierarchy,mechanism,mapping,ts,data, loading,dimension?.key,submitted]);

    // Start of ML 
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // End of ML analysis
    return (
        <Container>
            <GridTable 
                title = { `${report?.label??'DATIM Import'} Report` } 
                columns= { message?.columns??[] } 
                data = { message?.data??[] } 
                loading = { clicked }
            />                                                       
        </Container>   
    )
})