import React, { useCallback } from 'react'
import { AnalyticsData } from './AnalyticsData';
import { 
    getSelectedOrgUnit,
    getUniqArray,
    getValues,
    filterMap,
    getIndicatorDimensions
} from './Utils';
import isEmpty from 'lodash/isEmpty';

/**
 * Component to Generate Data Import Table
 */
export const AnalyticsList = ({ selected,ts,ds,config }) => {    
    const [indicators, setIndicators] = React.useState([]);
    const [mapping, setMapping] = React.useState([]);
    const pe = !isEmpty(selected)?selected[0].period:undefined;
    const dimension = !isEmpty(selected)?selected[0].dimensions:undefined;
    const ou = !isEmpty(selected)?getSelectedOrgUnit(selected[0].orgUnit):undefined;
    const report = !isEmpty(selected)?selected[0].report:undefined;
    const fetchData = useCallback(async()=>{    
        //const rsKeys = ['datimUid','datimCode','datimDisaggregationUid','sex','ageGroup','echoIndicatorUid','echoIndictorName','defaultUid','echoSexUid','echoAgeGroupUid','lessThan15AndAbove15Uid'];                   
        if(report?.key === 'hfr'){
            const items = getUniqArray(getIndicatorDimensions(report?.dataGroups,'id'));
            setIndicators(items);
        }
        else{
            if(!isEmpty(ds)){
                let defaultMap = [];
                // Filter by default
                if(dimension?.key === 'default'){
                    defaultMap=filterMap(ds,false,'defaultUid');
                }
                // Filter by Gender
                else if(dimension?.key === 'gender'){
                    defaultMap = filterMap(ds,false,'echoSexUid');
                }
                // Filter by Age Group
                else if(dimension?.key === 'ageGroup'){
                    defaultMap = filterMap(ds,false,'echoAgeGroupUid');
                }
                // Filter by Gender/Age Group
                else if(dimension?.key === 'genderAgeGroup'){
                    defaultMap = filterMap(ds,false,'echoSexUid','echoAgeGroupUid');
                }
                // Filter by <15 and 15+
                else if(dimension?.key === 'lessThan15AndAbove15'){
                    defaultMap =filterMap(ds,true,'lessThan15AndAbove15Uid','echoSexUid');
                }
                // Filter by <15 and 15+ and Gender
                else if(dimension?.key === 'lessThan15AndAbove15AndGender'){
                    defaultMap =filterMap(ds,false,'lessThan15AndAbove15Uid','echoSexUid');
                }
                else{
                    defaultMap=filterMap(ds,false,'defaultUid');
                }
                //const mapTs = getMappedKeys(ds,rsKeys);
                setMapping(defaultMap);
                const defaultInd = getUniqArray(getValues(defaultMap,'echoIndicatorUid'));
                setIndicators(defaultInd);
            }
            else{
                //ts && ds still loading
            }
        }
    },[ds,dimension?.key,report?.key,report?.dataGroups]);
    React.useEffect(()=>{
        fetchData()
    },[fetchData])
    return (
        
        <AnalyticsData 
            pe = { pe } 
            ou= { ou } 
            dimension ={ dimension?.dimension }
            ds = { ds } 
            ts ={ ts }
            config = { config }
            indicators = { indicators }
            mapping= { mapping }
            report = { report }
            />                                                
    )
}

