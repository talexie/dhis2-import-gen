import React, { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { useQueries } from 'react-query';
import { GridTable } from '../ui';
import isEmpty from 'lodash/isEmpty';
//import { defaultQueryFn } from './App';
import { 
    getCategoryDimensions,
    mergeDhis2AnalyticsData
} from '../utils';
import chunk from 'lodash/chunk';
import queryString from 'query-string';
import {createWorkerFactory, useWorker} from '@shopify/react-web-worker';
import { Container } from '@mui/system';

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
export const AnalyticsData = ({ ts,indicators,mapping,selected,config,updated }) => { 
    const worker = useWorker(createWorker);
    const [message, setMessage] = React.useState(null);   
    const [clicked, setClicked] = useState(updated);
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
    const chunkQuery =(q)=>(!isEmpty(pe) && !isEmpty(q))?`analytics.json?${qsQuery(q)}`:false;   
    const chunkedIndicators = chunk(indicators??[],config?.chunks??10)??[];
    const urls = chunkedIndicators.map((chunkedInd)=>chunkQuery(chunkedInd)).filter(Boolean).filter(String);
    const userQueries = useQueries(urls?.map((chunked) => {
            return {
                queryKey: [chunked],
                enabled: (chunked !== false),
                refetchOnWindowFocus: false,
            }
        }),
    );
    const { loading, data } = useMemo(()=>mergeDhis2AnalyticsData(userQueries),[userQueries]); 
    // Start of ML 
    useEffect(() => {
        (async () => {
        // Note: in your actual app code, make sure to check if Home
        // is still mounted before setting state asynchronously!
        if(!loading){
          const webWorkerMessage = await worker.getDataTable(
              ts,
              data,
              mapping,
              hierarchy,
              mechanism,
              dimension?.key
          );
         
          setMessage(t=>JSON.parse(webWorkerMessage));
        }
      })();
    }, [worker,hierarchy,mechanism,mapping,ts,data, loading,dimension?.key]);
    useEffect(()=>{
        setClicked(message?.loading);
    },message?.loading);
    // End of ML analysis
    return (
        <Container>
            <GridTable 
                title = { `${report?.label??'DATIM Import'} Report` } 
                columns= { message?.columns } 
                data = { clicked?[]:message?.data } 
                loading = { clicked }
            />                                                       
        </Container>   
    )
}