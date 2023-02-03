import { useRef, useEffect } from 'react';
import omit from 'lodash/omit';

/**
 * Create enum options for use in dropdowns
 * @param {*} data 
 * @param {*} label 
 * @param {*} value 
 * @returns Object
 */
export const enumOptions =(data,label="name",value="name")=>{
    if(Array.isArray(data)){
        return data?.map((d)=>{
            return({
                ...d,
                label : d?.label??(d?.[label]??d),
                value : d?.value??(d?.[value]??d)
            })
        })
    }
    else{ 
        return []
    }
}
/**
 * Avaliable DHIS2 supported groups
 */
export const dataGroupTypes = [
    {
        'id':1,
        'name':'DATA_ELEMEMT_GROUP',
        'label': "Data Element Group"
    },
    {
        'id':1,
        'name':'INDICATOR_GROUP',
        'label': "Indicator Group"
    }
]
/**
 * Remap data for creating report options
 * @param {*} data 
 * @param {*} key 
 * @returns Array of Objects
 */
export const remapData =( data,key='dimension',label='name',value='key' )=>{
    return data?.map((d)=>{
        const dim ={};
        dim.label =d?.name??d?.[label];
        dim.key = d?.key??d?.[value];
        dim.value =d?.key??d?.[value];
        return {
            ...dim,
            [key]:d
        }
    });
}
/**
 * usePrevious Hook
 * @param {*} value 
 * @returns 
 */
export const usePrevious = value => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };
  /**
   * Omit key from data array
   * @param {*} data 
   * @param {*} key 
   * @returns 
   */
export const omitKey =(data,key)=>{
    if(Array.isArray(data)){
        return data?.map((d)=>{
            return(omit(d,[key]));
        })
    }
    else{ 
        return []
    }
}