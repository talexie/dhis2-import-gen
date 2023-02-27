import * as React from 'react';
import { AnalyticsData } from './AnalyticsData';
import { 
    aiGetDataFrame,
    renameDataColumns,
    aiGetUniqueInColumn,
    aiReplaceNull,
} from '../utils';
import filter from 'lodash/filter';

export const getFilteredMapping = (aiDs,dimension,config,report)=>{
    const frequency = report?.frequency?.toUpperCase();
    // For each dimension, filter out from DS data and do the merge
        // Gender and Age only // EQUAL TO defaultMap below
        // Filter by Gender
        if(dimension?.key === 'gender'){
            return filter(aiDs,
                (o)=>(
                    [config?.financialYear??'FY22'] && o?.lessThan15AndAbove15Uid === "NULL_OR_UNDEFINED" && o?.defaultUid === "NULL_OR_UNDEFINED" && o?.frequency === frequency && o?.echoSexUid !=="NULL_OR_UNDEFINED" && o?.echoAgeGroupUid === "NULL_OR_UNDEFINED"
                ) 
            )
        }
        // Filter by Age Group
        else if(dimension?.key === 'ageGroup'){
            return filter(aiDs,
                (o)=>(
                    [config?.financialYear??'FY22'] && o?.lessThan15AndAbove15Uid === "NULL_OR_UNDEFINED" && o?.defaultUid === "NULL_OR_UNDEFINED" && o?.frequency === frequency && o?.echoSexUid ==="NULL_OR_UNDEFINED" && o?.echoAgeGroupUid !== "NULL_OR_UNDEFINED"
                )   
            )
        }
        // Filter by Gender and Age Group
        else if(dimension?.key === 'genderAgeGroup'){
            return filter(
                aiDs,
                (o)=>(
                    [config?.financialYear??'FY22'] && o?.lessThan15AndAbove15Uid === "NULL_OR_UNDEFINED" && o?.defaultUid === "NULL_OR_UNDEFINED" && o?.frequency === frequency && o?.echoSexUid !=="NULL_OR_UNDEFINED" && o?.echoAgeGroupUid !== "NULL_OR_UNDEFINED"
                )           
            )
        }
        // Filter by <15 and 15+
        else if(dimension?.key === 'lessThan15AndAbove15'){
            return filter(
                aiDs,
                (o)=>(
                    [config?.financialYear??'FY22'] && o?.lessThan15AndAbove15Uid !== "NULL_OR_UNDEFINED" && o?.defaultUid === "NULL_OR_UNDEFINED" && o?.frequency === frequency && o?.echoSexUid ==="NULL_OR_UNDEFINED" && o?.echoAgeGroupUid === "NULL_OR_UNDEFINED"
                ) 
            )
        }
        // Filter by <15 and 15+ and Gender
        else if(dimension?.key === 'lessThan15AndAbove15AndGender'){
            return filter(
                aiDs,
                (o)=>(
                    [config?.financialYear??'FY22'] && o?.lessThan15AndAbove15Uid !== "NULL_OR_UNDEFINED" && o?.defaultUid === "NULL_OR_UNDEFINED" && o?.frequency === frequency && o?.echoSexUid !=="NULL_OR_UNDEFINED" && o?.echoAgeGroupUid === "NULL_OR_UNDEFINED"
                ) 
            )
        }
        // default
        else if (dimension?.key === 'default'){
            return filter(
                aiDs,
                (o)=>(
                    [config?.financialYear??'FY22'] && o?.lessThan15AndAbove15Uid === "NULL_OR_UNDEFINED" && o?.defaultUid !== "NULL_OR_UNDEFINED" && o?.frequency === frequency && o?.echoSexUid ==="NULL_OR_UNDEFINED" && o?.echoAgeGroupUid === "NULL_OR_UNDEFINED"
                ) 
            )
        }
        else{
            return null;
        }
}


export const getAiDataFrame = (ds,config,dimension,report)=>{
    // Start of ML 
    if(ds){
        const aiDs = aiGetDataFrame(ds);
        const toFilter= aiReplaceNull(aiDs,['echoSexUid','echoAgeGroupUid','defaultUid','lessThan15AndAbove15Uid'])
        const indMapDataF = getFilteredMapping(toFilter?toFilter.toCollection():[],dimension,config,report);
        const indMapData = aiGetDataFrame(indMapDataF);
        const aiSelectedIndicators = aiGetUniqueInColumn(indMapData,'echoIndicatorUid');
        const renamedIndMapData = renameDataColumns(indMapData,[
            {
                old:"echoIndicatorUid",
                new:"EchoIndicatorUid",
            },
            {
                old: "echoSexUid",
                new: "EchoGenderCatOptionUid"
            },
            {
                old:"echoAgeGroupUid",
                new: "EchoAgeGroupCatOptionUid"
            },
            {
                old:"lessThan15AndAbove15Uid",
                new: "EchoAgeGroupLessThan15AndAbove15Uid"
            },
            {
                old: "datimUid",
                new: "DatimDataElementUid"
            },
            {
                old:"datimDisaggregationUid",
                new: "DatimDisaggregationUid"

            },
            {
                old: "datimCode",
                new: "DatimDataElementCode"
            },
            {
                old: "echoIndicatorName",
                new: "EchoIndicatorName"
            },
            {
                old: "datimDisaggregation",
                new: "DatimDisaggregationName"
            }
        ]);
        return {
            df: renamedIndMapData??null,
            ind:aiSelectedIndicators?aiSelectedIndicators.toArray():[]
        }
    }
    return {
        df: null,
        ind:[]
    };
    // End of ML analysis
    
}
/**
 * Component to Generate Data Import Table
 */
export const AnalyticsList = React.memo(({ selected,ts,ds,config }) => {  
    const { dimensions, report } = selected;
    const { df: data, ind:aiSelectedIndicators } = getAiDataFrame(ds,config,dimensions?.dimension,report);
    return (
        <AnalyticsData 
            ts ={ JSON.stringify(ts) }
            config = { config }
            indicators = { aiSelectedIndicators }
            mapping= { JSON.stringify(data?data.toCollection():null) }
            selected = { selected }
        />                                                
    )
});

