import { aiRenameLabels } from "./Ml";
import { merge, get, set, omit, size,map,find, difference } from 'lodash';

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
export const getOuNameHierarchy =(ouNames,maxLevel,isSameLevel=true)=>{

    return Object.entries(ouNames??{})?.map(([key,value])=>{
        const splitName = value?.split("/")?.filter(Boolean)?.filter(String);
        const splitNameObj = {
            'ou': key
        };
        splitName?.forEach((n,i)=>{
            if(isSameLevel){
                splitNameObj[`level${i+1}`]=n;
            }
            else{
                splitNameObj[`level${maxLevel+i}`]=n;
            }            
        });
        return splitNameObj;
    })
}
/**
 * Create columns from levels
 * @param {*} levels 
 */
export const getOuLevelColumns =(levels)=>{
    return levels?.map((level)=>{
        if(level?.level ===4){
            return ({ 
                old:`level${level?.level}`,
                new: "Province"
            });
        }
        else if(level?.level ===5){
            return ({ 
                old:`level${level?.level}`,
                new: "District"
            });
        }
        else{
            return ({ 
                old:`level${level?.level}`,
                new: level?.name??level?.displayName
            });
        }
    });    
}
/**
 * Merge DHIS2 analytics data from parallel fetches
 */
export const useMergeDhis2AnalyticsData =(data)=>{
    const mergedData = {
        headerWidth:0,
        headers:[],
        metaData:{},
        width:0,
        height:0,
        rows:[],
        
    };
    let loading = true;
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
        loading: data?.every((x)=>x?.isLoading)
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
                newObj[column?.new] = parseFloat(value[column?.old])?.toFixed(0); 
            }
            else{
                newObj[column?.new]=value[column?.old]
            }            
        });
        return  newObj;
    });
}
/**
 * Merge two JSON array objects
 * @param {*} left 
 * @param {*} right 
 * @param {*} keys 
 * @returns 
 */

export const nativeMerge =(left=[],right=[],keys=[])=>{
    return map(left,(l)=>{ 
        const innerRow = find(right,(r)=>{
            const check = keys?.reduce((acc,k)=>{
                const leftValue = get(l,k);
                const rightValue = get(r,k);
                const accTest = acc && ( leftValue?.trim() === rightValue?.trim());
                return accTest;
            },true);
             return check;
        });
        return merge(l,innerRow); 
    })
}
/**
 * Rename columns names
 * @param {*} data 
 * @param {*} columns 
 * @returns 
 */
export const nativeSepLabels = (data,sep=false,key={'old':" ",'new':"_"})=>{
    return map(data,(d)=>{
        Object.keys(d)?.forEach((c)=>{
            if(sep){
                set(d,c?.replaceAll(key.old,key.new),get(d,c));
                delete d?.[c];
            }            
        });
        return d;
    })
}
/**
 * Rename columns names
 * @param {*} data 
 * @param {*} columns 
 * @returns 
 */
export const nativeRenameLabels = (data,columns=[],tracker=false)=>{
    return map(data,(d)=>{    
        columns?.forEach((c)=>{
            const value = get(d,c?.old); 
            if(tracker && (typeof value === 'boolean' || value instanceof Boolean)){
                set(d,c?.new,value?.toString());
            }
            else{
                set(d,c?.new,value);
            }
            delete d?.[c?.old];
        });
        return d;
    })
}
/**
 * Add null value to null or undefined columns or missing
 * @param {*} data
 * @param {*} columns 
 * @param {*} value 
 * @returns 
 */
export const nativeReplaceNull = (data,columns=[],value="NULL_OR_UNDEFINED",missing=true)=>{
    const dataToReplace = data;
    return map(dataToReplace,(d)=>{
        columns?.forEach((c)=>{
            if(Object.hasOwn(d,c)){
                if(!get(d,c)){
                    set(d,c,value);
                }                
            }    
            else{
                if(missing){
                    set(d,c,value);
                }
            }        
        })
        return d;
    });
}
/**
 * Convert to value
 * @param {*} v 
 * @returns 
 */
export const toValue =(v)=>{
    let value = v;
    const regex = /[a-zA-Z\s?#%]*/ig;
    //const match = [...value?.matchAll(regex)];
    if((typeof value === 'string') && value) {
        value = value?.trim();
        value = value?.replaceAll('%','')?.replaceAll('#','')?.replaceAll("'","")?.replaceAll('"','');
        value = value.replaceAll(regex,'');
        if(value){
            value = parseInt(value);
        }
        return value;
    }
    else if((typeof value !== 'string') && value) {
        value = value?.toString();
        value = value?.trim();
        value = value?.replaceAll('%','')?.replaceAll('#','')?.replaceAll("'","")?.replaceAll('"','');
        
        value = value.replaceAll(regex,'');
        if(value){
            value = parseInt(value);
        }
        return value;
    }
    else{
        return value;
    }    
}

/**
 * Drop columns names
 * @param {*} data 
 * @param {*} columns 
 * @returns 
 */
export const nativeDropLabels = (data,columns=[])=>{
    return map(data,(d)=>{
        return omit(d,columns);
        
    })
}

/**
 * Add a column to data frame
 * @param {*} data 
 * @param {*} colName 
 * @param {*} value 
 * @returns 
 */
export const nativeAddLabels = (data,colName="AddColumnName",value="")=>{
    return map(data,(d)=>{
        set(d,colName,value);
        return d;
    })
}
/**
 * Add data to labels
 * @param {*} data 
 * @param {*} colNames 
 * @param {*} value 
 * @param {*} type 
 * @returns 
 */
export const nativeAddLabelValue = (data,colNames=[],value,type="TEXT")=>{
    return map(data,(d)=>{
        colNames?.forEach((colName)=>{
            if(type==="BOOL"){
                if(value === "1" || value === 1 || value === "True" || value === "TRUE"){
                    set(d,colName,true);
                }
                else if(value === "0" || value === 0 || value === "False" || value === "FALSE"){
                    set(d,colName,false);
                }
                else{
                    set(d,colName,value??get(d,colName));
                }                
            }
            else{
                set(d,colName,value??get(d,colName));
            }            
        })
        return d;
    })
}
export const nativeSelectByDropColumns =(data,columns=[])=>{
    return map(data,(d,i)=>{
        const keys = Object.keys(d);
        if(!Object.hasOwn(d,'id')){
            d['id'] = i
        }
        const variantCols = difference(keys,columns);
        return omit(d,variantCols)
    })
}
/**
 * 
 * @param {*} lookupTable 
 * @param {*} mainTable 
 * @param {*} lookupKey 
 * @param {*} mainKey 
 * @param {*} select 
 * @returns 
 * @example
 * var result = join(brands, articles, "id", "brand_id", function(article, brand) {
    return {
        id: article.id,
        name: article.name,
        weight: article.weight,
        price: article.price,
        brand: (brand !== undefined) ? brand.name : null
    };
}); 
 */
export const join =(lookupTable, mainTable, lookupKey, mainKey, select)=> {
    var l = lookupTable.length,
        m = mainTable.length,
        lookupIndex = [],
        output = [];
    for (var i = 0; i < l; i++) { // loop through l items
        var row = lookupTable[i];
        lookupIndex[row[lookupKey]] = row; // create an index for lookup table
    }
    for (var j = 0; j < m; j++) { // loop through m items
        var y = mainTable[j];
        var x = lookupIndex[y[mainKey]]; // get corresponding row from lookupTable
        output.push(select(y, x)); // select only the columns you need
    }
    return output;
};
