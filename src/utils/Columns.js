import { aiRenameLabels } from "./Ml";
import { merge, get, set, omit, size } from 'lodash';

/**
 * Extract columns from headers.
 * @param {*} headers 
 * @returns 
 */
export const getDataColumns =(headers)=>{
    return headers?.map((header, index)=>({
        old: index,
        new: header?.name
    }));
}
/**
 * Rename columns in data
 * @param {*} df 
 * @param {*} columns 
 * @returns 
 */
export const renameDataColumns =(df,columns=[])=>{
    if(df && df !== null){
        return columns?.reduce((curr,column)=>{
            return aiRenameLabels(curr,column?.old,column?.new);
        },df);
    }
    return df;
}
/**
 * Drop multi columns on a dataframe
 * @param {*} df 
 * @param {*} columns 
 * @returns 
 */
export const dropMultiColumns =(df,columns=[])=>{
    if(df && df !== null){
        return columns?.reduce((curr,x)=>{
            const currCols = curr.listColumns();
            if(currCols?.some((z)=>z===x)){
                return curr.drop(x);
            }
            return curr;    
        },df);
    }
    return df;
}
/**
 * Create an OU hierearchy
 * @param {*} ouNames 
 * @returns 
 */
export const getOuNameHierarchy =(ouNames)=>{
    return Object.entries(ouNames??{})?.map(([key,value])=>{
        const splitName = value?.split("/");
        const splitNameObj = {
            'ou': key
        };
        splitName?.forEach((n,i)=>(splitNameObj[`level${i+1}`]=n));
        return splitNameObj;
    })
}
/**
 * Create columns from levels
 * @param {*} levels 
 */
export const getOuLevelColumns =(levels)=>{
    return levels?.map((level)=>({ 
        old:[`level${level?.level}`],
        new: level?.name??level?.displayName
    }));
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
        rows:[],
        
    };
    let loading = size(data) && Array.isArray(data)?true: false;
    
    return {
        data: JSON.stringify(Array.isArray(data)? data?.reduce((acc,d,index)=>{
            if (index === 0) {
                acc = merge(mergedData,omit(d?.data,['rows']));
            }
            set(acc,'height',(get(acc, 'height') ?? 0 + get(d?.data, 'height') ?? 0));
            const currentData = get(acc, 'rows') ?? [];
            const newData = get(d?.data, 'rows') ?? [];
            set(acc, 'rows', currentData.concat(newData));
            loading = ((index + 1)=== size(data))?d?.isLoading: true;
            return acc;
        },mergedData):[]),
        loading: loading
    }
}
/**
 * Merge data with columns
 * @param {*} data 
 * @param {*} columns 
 * @returns 
 */
export const mergeColumnsAndData =(data=[],columns=[])=>{
    return data?.map((value)=>{
        const newObj = {};
        columns?.forEach((column)=>{
            if(column?.new === 'value'){
                newObj[column?.new] = parseFloat(value[column?.old]).toFixed(0); 
            }
            else{
                newObj[column?.new]=value[column?.old]
            }            
        });
        return  newObj;
    });
}