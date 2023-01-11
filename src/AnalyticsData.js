import React, { useCallback } from 'react'
import useSWR from 'swr';
//import { useQueries } from '@tanstack/react-query';
import { DisplayTable } from './DisplayTable';
import { makeStyles } from '@material-ui/styles';
import isEmpty from 'lodash/isEmpty';
import { useConfig } from '@dhis2/app-runtime';
//import { defaultQueryFn } from './App';
import { 
    createDataMap,
    getUniqArray,
    getCategoryDimensions,
    uniqueData,
} from './Utils';
import chunk from 'lodash/chunk';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import * as qs from 'qs';
import set from 'lodash/set';
import get from 'lodash/get';

const useStyles = makeStyles({
    root: {
        marginTop: 10,
        marginLeft: 20
    },
    orgUnit: {      
      marginLeft: 20
    }
});
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
 * Get columns titles for report
 * @param {*} report 
 * @returns 
 */
const getReportHeaders =(headers,field='field')=>{
    if(!isEmpty(headers)){
        return headers?.map((h)=>h?.[field]);
    }
    else{
        return [];
    }
}
/**
 * Merge DHIS2 analytics data from parallel fetches
 */
export const mergeDhis2AnalyticsData =(data)=>{
    const mergedData = {
        headerWidth:0,
        headers:[],
        metaData:{},
        width:0,
        height:0,
        rows:[]
    };
    return data?.reduce((acc,d,index)=>{
        if (index === 0) {
            acc = merge(mergedData,omit(d,['rows']));
        }
        set(acc,'height',(get(acc, 'height') ?? 0 + get(d, 'height') ?? 0));
        const currentData = get(acc, 'rows') ?? [];
        const newData = get(d, 'rows') ?? [];
        set(acc, 'rows', currentData.concat(newData));
        return acc;
    },mergedData);
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
export const AnalyticsData = ({ pe,ou,dimension,ts,indicators,mapping,report,config }) => {    
    const classes = useStyles();
    const { baseUrl } = useConfig();
    const [tableData,setTableData] = React.useState([]);
    const [loading,setLoading]=React.useState(true);
    const [columns, setColumns ] = React.useState([]);
        
    const dim= getCategoryDimensions(dimension?.items);  
    const filterMechanism = getFilterMechanism(report);
    const mechanism = report?.mechanism; 
    const levels = report?.levels;
    const catOptionFilter = isEmpty(dim)?[]:dim;
    const qsQuery =(q)=> qs.stringify({
        dimension:[
            `pe:${pe?.join(';')}`,
            `ou:OU_GROUP-dUBw75sMCZR`,
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
    const chunkQuery =(q)=>!isEmpty(pe) && !isEmpty(q)?`${baseUrl}/api/analytics.json?${qsQuery(q)}`:null;   
    const chunkedIndicators = chunk(indicators??[],config?.chunks??3);
    /*const userQueries = useQueries({
        queries: chunkedIndicators.map((chunkedInd) => {
            const chunked = chunkQuery(chunkedInd);
            return {
                queryKey: [chunked],
                //queryFn: ()=> defaultQueryFn(chunked),
                enabled: !chunked
            }
        }),
    });
    console.log("Parallel data:",userQueries);*/
    const urls = chunkedIndicators.map((chunkedInd)=>chunkQuery(chunkedInd)).filter(Boolean).filter(String);
    const { data } = useSWR(isEmpty(urls)?null:urls, fetcher);     
    const fetchData = useCallback(async()=>{
        setLoading(true); 
        let keys = ['datimId','datimName','District','Province','datimUid','datimCode','datimDisaggregationUid','datimDisaggregation','sex','ageGroup','lessThan15AndAbove15','echoIndicatorUid','echoIndicatorName','mechanism','frequency']; 

        if(data){ 
            if(report?.key === 'hfr'){
                keys = getReportHeaders(report?.headers)??[];
            } 
            /** To Do, create a dropdown to allow choice of mapping data e.g Fy20, FY21, FY22 */ 
            const mappingPeriod = config?.financialYear??'FY22';  
            const tsMapped = createDataMap(mergeDhis2AnalyticsData(data),keys,ts,mapping,levels,mappingPeriod,report?.location,report?.indicator);
            const dataRows = tsMapped?.data?.map((r)=>{
                return {
                    ...r,
                    mechanism: mechanism
                }
            })
            setTableData(dataRows);
            const cols=uniqueData(getUniqArray(tsMapped?.columns),'field');
            setColumns(cols); 
        } 
        else{
            setTableData([]);
        }  
        setLoading(false);                                            
    },[ts,mapping,data,mechanism,levels,report?.key,report?.headers,report?.location,report?.indicator]);
    React.useEffect(()=>{
        fetchData()
    },[fetchData])
    return (
        <div className= { classes.root }>
            <DisplayTable 
                title = { `${report?.label??'DATIM Import'} Report` } 
                columns= { columns } 
                data = { tableData } 
                loading = { loading }
                />                                                       
        </div>   
    )
}

