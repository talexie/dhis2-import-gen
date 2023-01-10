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

const fetcher = (...urls) => {
    const f = url => fetch(url).then(r => r.json())
    return Promise.all(urls.map(url => f(url)))
}
/**
 * Component to Generate Data Import Table
 */
export const AnalyticsData = ({ pe,ou,dimension,ts,indicators,mapping,report }) => {    
    const classes = useStyles();
    const { baseUrl } = useConfig();
    const [tableData,setTableData] = React.useState([]);
    const [loading,setLoading]=React.useState(true);
    const [columns, setColumns ] = React.useState([]);
        
    const dim= getCategoryDimensions(dimension?.items);  
    const filterMechanism = getFilterMechanism(report);
    const mechanism = report?.mechanism; 
    const levels = report?.levels;
    const query = !isEmpty(pe) && !isEmpty(ou) && !isEmpty(indicators)?`${baseUrl}/api/analytics.json?dimension=pe:${pe?.join(';')}${isEmpty(dim)?'':'&'}${dim?.join('&')}&dimension=ou:LEVEL-6;${ou?.join(';')}&dimension=dx:${ indicators?.join(';')}&filter=${filterMechanism}&displayProperty=NAME&hierarchyMeta=true&showHierarchy=true&hideEmptyRows=true&hideEmptyColumns=true`:null; 
    const chunkQuery =(q)=>!isEmpty(pe) && !isEmpty(ou) && !isEmpty(q)?`/api/analytics.json?dimension=pe:${pe?.join(';')}${isEmpty(dim)?'':'&'}${dim?.join('&')}&dimension=ou:OU_GROUP-dUBw75sMCZR&dimension=dx:${ q?.join(';')}&filter=${filterMechanism}&displayProperty=NAME&hierarchyMeta=true&showHierarchy=true&hideEmptyRows=true&hideEmptyColumns=true`:null;     

    const chunkedIndicators = chunk(indicators??[],5);
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
    const urls = chunkedIndicators.map((chunkedInd)=>chunkQuery(chunkedInd));
    const { data, error } = useSWR(urls, fetcher);
    console.log("Parallel data:",data);
    //const { data } = useSWR(query);       
    const fetchData = useCallback(async()=>{
        setLoading(true); 
        let keys = ['datimId','datimName','District','Province','datimUid','datimCode','datimDisaggregationUid','datimDisaggregation','sex','ageGroup','lessThan15AndAbove15','echoIndicatorUid','echoIndicatorName','mechanism','frequency']; 
        if(report?.key === 'hfr'){
            keys = getReportHeaders(report?.headers)??[];
        } 
        if(data){ 
            /** To Do, create a dropdown to allow choice of mapping data e.g Fy20, FY21, FY22 */ 
            const mappingPeriod = 'FY22';  
            const tsMapped = createDataMap(data,keys,ts,mapping,levels,mappingPeriod,report?.location,report?.indicator);
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

