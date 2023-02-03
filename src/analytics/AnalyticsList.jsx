import * as React from 'react';
import { AnalyticsData } from './AnalyticsData';
import { 
    aiGetDataFrame,
    renameDataColumns,
    aiGetUniqueInColumn,
} from '../utils';

export const getFilteredMapping = (aiDs,dimension,config)=>{

    // For each dimension, filter out from DS data and do the merge
        // Gender and Age only // EQUAL TO defaultMap below
        // Filter by Gender
        if(dimension?.key === 'gender'){
            return aiDs.chain(
                //row => row.get([config?.financialYear??'FY22']) === true,
                row => row.get("echoSexUid") !== null,
                row => row.get("echoAgeGroupUid") === null,
                row => row.get("lessThan15AndAbove15Uid") === null
            )
        }
        // Filter by Age Group
        else if(dimension?.key === 'ageGroup'){
            return aiDs.chain(
                //row => row.get([config?.financialYear??'FY22']) === true,
                row => row.get("echoAgeGroupUid") !== null,
                row => row.get("echoSexUid") === null
                
            )
        }
        // Filter by Gender and Age Group
        else if(dimension?.key === 'genderAgeGroup'){
            return aiDs.chain(
                //row => row.get([config?.financialYear??'FY22']) === true,
                row => row.get("echoAgeGroupUid") !== null,
                row => row.get("echoSexUid") !== null               
            )
        }
        // Filter by <15 and 15+
        else if(dimension?.key === 'lessThan15AndAbove15'){
            return aiDs.chain(
                //row => row.get([config?.financialYear??'FY22']) === true,
                row => row.get("lessThan15AndAbove15Uid") !== null,
                row => row.get("echoSexUid") === null
            )
        }
        // Filter by <15 and 15+ and Gender
        else if(dimension?.key === 'lessThan15AndAbove15AndGender'){
            return aiDs.chain(
               // row => row.get([config?.financialYear??'FY22']) === true,
                row => row.get("lessThan15AndAbove15Uid") !== null,
                row => row.get("echoSexUid") !== null,
            )
        }
        // default
        else{
            return aiDs.chain(
               // row => row.get([config?.financialYear??'FY22']) === true,
                row => row.get("defaultUid") !== null
            )
        }
}


export const useGetAiDataFrame = (ds,config,dimension)=>{
    // Start of ML 
    if(ds){
        const aiDs = aiGetDataFrame(ds);
        const indMapData = getFilteredMapping(aiDs,dimension,config);
        const aiSelectedIndicators = aiGetUniqueInColumn(indMapData,'echoIndicatorUid');
        const renamedIndMapData = renameDataColumns(indMapData,[
            {
                old:"echoIndicatorUid",
                new:"EchoIndicatorID",
            },
            {
                old: "echoSexUid",
                new: "EchoGenderCatOptionUid"
            },
            {
                old:"ageGroup",
                new: "EchoAgeGroupCatOptionUid"
            },
            {
                old:"lessThan15AndAbove15",
                new: "EchoAgeGroupLessThan15AndAbove15Uid"
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
    const [clicked, setClicked] = React.useState(false);
    const { dimensions, report, clicked: isClicked } = selected;

    //const ou = !isEmpty(selected)?getSelectedOrgUnit(selected[0].orgUnit):undefined;
    const { df: data, ind:aiSelectedIndicators } = useGetAiDataFrame(ds,config,dimensions?.dimension);
    /*
    const fetchData = useCallback(async()=>{                       
        if(report?.key === 'hfr'){
            const items = getUniqArray(getIndicatorDimensions(report?.dataGroups,'id'));
            setIndicators(items);
        }
        
    },[ds,dimension?.key,report?.key,report?.dataGroups]);
    */
    React.useEffect(()=>{
        setClicked(isClicked);
    })
    return (
        <AnalyticsData 
            ts ={ JSON.stringify(ts) }
            config = { config }
            indicators = { aiSelectedIndicators }
            mapping= { JSON.stringify(data?data.toCollection():null) }
            selected = { selected }
            updated = { clicked}
        />                                                
    )
});

