import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import startCase from 'lodash/startCase';
import isPlainObject from 'lodash/isPlainObject';
import uniq from 'lodash/uniq';
import { utils, writeFileXLSX,read,writeFile } from 'xlsx';
import { merge } from 'lodash';

/**
 * Create a data map
 * @param {*} data 
 * @param {*} mechanism 
 * @param {*} keys 
 * @param {*} tsKeys 
 * @param {*} ts 
 * @param {*} ds 
 */
export const createDataMap=(data,keys,ts,ds,levels,period,locationMap=true,indicatorMap=true)=>{
    const nameHierarchy = data?.metaData?.ouNameHierarchy;
    const headerCols = createColumns(data?.headers);
    const cols = createMoreColumns(headerCols,keys); 
    const rows = createTableData(data); 
    let orgUnitMapped = []; 
    if(locationMap){
        const hierarchyOrgUnitMapped = addHierarchy(ts,nameHierarchy,levels,'id');
        orgUnitMapped = mapOrgUnits(rows,hierarchyOrgUnitMapped,'ou','id',keys);  
    }
    else{
        orgUnitMapped = addHierarchy(rows,nameHierarchy,levels,'id');
    }
    const tsMapped = getDataMap(orgUnitMapped,ds,indicatorMap,period);
    return {
        data:tsMapped,
        columns:cols
    };
}
/**
 * Add indicator mappings
 * @param {*} orgUnitMapped 
 * @param {*} ds 
 * @param {*} indicatorMap 
 * @returns 
 */
export const getDataMap =(orgUnitMapped,ds,indicatorMap=true,period)=>{
    let tsMapped = [];
    if(indicatorMap){
        tsMapped = mapData(orgUnitMapped,ds,period);
    }
    else{
        tsMapped = orgUnitMapped;
    }
    return tsMapped;
}
/**
 * Add Hierarch (Geo Locations) to data
 * @param {*} data 
 * @param {*} hierarchy 
 * @param {Array} levels e.g [{ 'name':"District",level: 2}]
 * @param { String } id e.g name or id
 */
export const addHierarchy =(data,hierarchy,levels,id)=>{
    return data?.map((d)=>{
        const ouNames = hierarchy?.[d?.[id]];
        const hierarchyArray = ouNames?.split('/');
        const dn = {};
        if(!isEmpty(hierarchyArray) && !isEmpty(levels)){
            levels?.forEach((l)=>{
                const ouLevels = hierarchyArray?.length;
                if(ouLevels > 0){
                    dn[l?.name]  = hierarchyArray[(ouLevels-1)-parseInt(l?.level)];
                }                
            });
        }           
        return merge(d,dn);
    });
}
/**
 * Get category dimensions
 * @param {*} category
 */
export const getCategoryDimensions =(category)=>{
    if(!isEmpty(category)){
        return category.map((cat)=>{
            let key='categoryOptions';
            if(cat.type ==='CATEGORY_GROUP_SET'){
                key='categoryOptionGroups';
            }
            /*const dimension = cat?.[key]?.map((option)=>{
                return option?.id;
            }).filter(Boolean).filter(String);
            return `${cat?.id}:${dimension?.join(';')}`;*/
            return cat?.id;
        }).filter(Boolean).filter(String)
    }
    else{
        return [];
    }
}
/**
 * Create Columns from Headers
 * @param {*} headers 
 */
export const createColumns=(headers)=>{
    if(!isEmpty(headers)){
        return headers.map((hr)=>{
            hr.field = hr.name;
            hr.title = hr.column;
            hr.headerName = hr.column;
            return hr;
        })
    }
    else{
        return [];
    }
}
/**
 * Add more Columns from mappings
 * @param {*} keys 
 */
export const createMoreColumns=(columns,keys,idKey='id')=>{
    if(!isEmpty(keys)){
        keys.forEach((k,i)=>{
            if(isPlainObject(k)){
                columns.push({
                    ...k,
                    field :k?.field??k,
                    title : k?.name??(k?.label??k),
                    order : k?.order??i,
                    headerName : k?.name??(k?.label??k),
                    disableExport: k?.field ===idKey || k===idKey,
                    hide: k?.field ===idKey || k===idKey
                });
            }
            else{
                columns.push({
                    field : k?.field??k,
                    title : k?.name??(k?.label??k),
                    headerName : k?.name??(k?.label??k),
                    order : k?.order??i,
                    disableExport: k?.field ===idKey || k===idKey,
                    hide: k?.field ===idKey || k===idKey
                });
            }
        })
    }
    return columns;
}
/**
 * Add header key to data
 * @param {*} data 
 * @param {*} headers 
 */
export const addHeaderKey=(data,headers)=>{
    const dataValue  = {};
    if(!isEmpty(data)){
        data.forEach((dv,index)=>{
            if(headers[index].name === 'value'){
                dataValue[headers[index].name] = parseFloat(dv).toFixed(0); 
            }
            else{
                dataValue[headers[index].name] = dv;
            }
        });
    }
    return dataValue;
}
/**
 * Map analytics data to headers
 * @param {*} data 
 */
export const createTableData=(data)=>{
    if(!isEmpty(data?.rows)){
        return data.rows.map((dv)=>{
            return addHeaderKey(dv,data.headers);
        });
    }
    else{ 
        return []; 
    }
}
export const pathToId = path => {
    const pathSplit = path.split('/')
    const orgId = pathSplit[pathSplit.length - 1]
    return orgId
}
export const filterMapping = (mappings,lKey,rKey,value)=>{
    if(!isEmpty(mappings)){
        return mappings.filter((mapping)=>{
            return (mapping[rKey] === value[lKey]);
        })
    }
}

export const filterEqual = (data,key,search,rKey)=>{
    if(!isEmpty(data)){
        return data.map((dv)=>{
            if(isEqual(dv[key],search)){
                return dv[rKey];
            }
            else{
                return undefined;
            }
        }).filter(Boolean);
    }
    else{
        return []
    }
}
export const filterDataMapping = (mappings,value,valueKey,mappingKey,noDisagg)=>{
    return filter(mappings,(mapping)=>{
        // Get Categories Ids which will be keys in data.
        // Data for category will be the category options
        if(noDisagg){
           return (value[valueKey] === mapping[mappingKey]);
        }
        else{
            if(!isEmpty(mapping.categoryCombo_categories)){
                //const categoryMap = getCategories(mapping.categoryCombo_categories);
                let dataCatOptions = [];
                let matchedCatOptions = [];            
                mapping.categoryCombo_categories.forEach((category)=>{                                        
                    if(!isEmpty(category)){
                        dataCatOptions.push(value[category.id]);
                        if(!isEmpty(category.categoryOptions)){
                            category.categoryOptions.forEach((option)=>{
                                const disagg = mapping['disaggregationName']?mapping['disaggregationName'].split(','):[];
                                if(option.id === value[category.id] && (disagg.indexOf(option.name) > -1)){
                                    matchedCatOptions.push(option.id);
                                }               
                            })
                        }
                        else{
                            return false;
                        }
                    }
                    else{
                        return false;
                    }    
                })
                return (isEqual(dataCatOptions,matchedCatOptions) && (value[valueKey] === mapping[mappingKey]));
            }
            else{
                return false;
            }
        }
    });
}

/**
 * Map OrgUnits in the datastore to data
 * @param {*} data 
 * @param {*} mappings 
 * @param {*} lKey 
 * @param {*} rKey 
 * @param {*} keys 
 */
export const mapOrgUnits=(data,mappings,lKey,rKey,keys=[])=>{
    return data?.map((dv)=>{
         const mp = filterMapping(mappings,lKey,rKey,dv);
         if(!isEmpty(keys)){
             keys.forEach((mkey)=>{
                 if(!isEmpty(mp)){
                     dv[mkey] = mp[0][mkey];
                 }
                 else{
                     dv[mkey] = "";
                 }                
             })
         }       
         return dv;
    })
 }
/**
 * Get categories by key
 * @param {*} categories 
 * @param {*} key 
 */
export const getCategories=(categories,key='id')=>{
    if(!isEmpty(categories)){
        return categories.map((category)=>{
            return category[key];
        })
    }
    else{
        return [];
    }
    
}
/**
 * Get indicators and categories
 * @param {*} categories 
 * @param {*} key 
 */
export const getCategoryDimension=(categories,key='id')=>{
    if(!isEmpty(categories)){
        return categories.map((category)=>{
            let categoryMap = []; 
            if(!isEmpty(category[key])){                        
                category[key].forEach((dim)=>{                                        
                    if(!isEmpty(dim)){
                        if(dim.name !== 'default'){                            
                            categoryMap.push( dim.id );
                        }                        
                    }
                })
            }
            return categoryMap;
        })
    }
    else{
        return [];
    }
    
}
export const getDimensions=(categories,key='id')=>{
    if(!isEmpty(categories)){
        return categories.map((category)=>{
            let categoryMap = { items:[]};
            categoryMap.id = category['indicator_id'];
            categoryMap.default = false;
            if(!isEmpty(category[key])){                        
                category[key].forEach((dim)=>{                                        
                    if(!isEmpty(dim)){
                        if(dim.name !== 'default'){                                
                            categoryMap.items.push(dim.id);                            
                        }
                        else{
                            categoryMap.default = true;
                            categoryMap.items.push(dim.id);
                        }                        
                    }
                })
            }
            return categoryMap;
        })
    }
    else{
        return [];
    }
    
}
/**
 * Filter values by key
 * @param {*} data 
 */
export const getValues=(data,key)=>{
    if(!isEmpty(data)){
        return data.map((dv)=>{
            return dv?.[key];
        }).filter(Boolean).filter(String);
    }
    else{
        return [];
    }
}
/**
 * Get items from object
 * @param {*} data 
 */
export const getObjectItems=(data)=>{
    if(!isEmpty(data)){
        return data.map((dv)=>{
            return dv[Object.keys(dv)[0]];
        })
    }
    else{
        return [];
    }
}
/**
 * Get selected OrgUnits
 * @param {*} selected 
 */
export const getSelectedOrgUnit=(selected)=>{
    if(!isEmpty(selected)){
        return selected.map((category)=>{
            return pathToId(category);
        })
    }
    else{
        return [];
    }
    
}
/**
 * Get Unique array by key
 * @param {*} a 
 * @param {*} key 
 */
export const uniqBy=(a, key)=> {
    let seen = new Set();
    return a.filter(item => {
        let k = key(item);
        return seen.has(k) ? false : seen.add(k);
    });
}
/**
 * Get Unique array
 * @param {*} data 
 */
export const getUniqArray=(data)=>{
    return Array.from(new Set(data.map(JSON.stringify)), JSON.parse).filter(Boolean).filter(String);
}
/**
 * Get unique array by key
 */
export const uniqueData = (data,key)=>{
    return Array.from(new Set(data.map(a => a[key]))).map(id => {
   return data.find(a => a[key] === id)
 })
}
    
/**
 * Concat arrays
 * @param {*} data 
 */
export const concatArray =(data)=>{
    let newArray =[];
    if(!isEmpty(data)){
        data.forEach((dv)=>{
            newArray.concat(dv);
        })
    }
    return newArray;
}
export const getMappedKeys =(data,keys)=>{
    let dataMap =[];
    if((data !== undefined ) && (keys !== undefined)){
        dataMap = data?.map((dv)=>{
            const dvObject = {};
            keys.forEach((k)=>{
                dvObject[k] = dv[k]
            });
            return dvObject;
        });
    }
    return dataMap;
}
/**
 * Filter mapping based on columns
 * @param {*} mappings 
 * @param {*} key 
 * @param {*} key2 
 * @param {*} key3
 */
export const filterMap = (mappings,multi=false,key,key2=undefined,key3=undefined)=>{
    if(!isEmpty(mappings)){
        return mappings.filter((mapping)=>{
            if(key && key2 && key3){
                return (mapping[key]?true:false) && (mapping[key2]?true:false) && (mapping[key3]?true:false);
            }
            else if(key && key2 && !multi){
                return (mapping[key]?true:false) && (mapping[key2]?true:false);
            }
            else if(key && key2 && multi){
                return (mapping[key]?true:false) && (mapping[key2]?false:true);
            }
            else{
                return (mapping[key]?true:false);
            }            
        });
    }
    else{
        return [];
    }
}
/** Map data based on new mapping
 * @param {Array} data
 * @param {Array} dataMap
 * @param {String} period
 */
export const mapData =(data,dataMap,period)=>{
    return data?.map((d)=>{
        const dtKeys =  Object.values(d);
        const mapped=dataMap?.find((dm)=>{ 
            if(d && dm && dtKeys && !isEmpty(d) && !isEmpty(dm) && !isEmpty(dtKeys) && dm?.[period]){  
                // Gender and age group       
                if((dtKeys.indexOf(dm.echoSexUid ) > -1) && dm.defaultUid === null && dm.lessThan15AndAbove15Uid === null && (dtKeys.indexOf(dm.echoAgeGroupUid ) > -1) && (d.dx === dm.echoIndicatorUid)){
                    return dm;
                }
                //Age group
                else if( dm.echoSexUid === null && dm.defaultUid === null && dm.lessThan15AndAbove15Uid === null && (dtKeys.indexOf(dm.echoAgeGroupUid ) > -1) && (d.dx === dm.echoIndicatorUid)){
                    return dm;
                }
                 //Gender
                 else if( dm.echoAgeGroupUid === null && dm.defaultUid === null && dm.lessThan15AndAbove15Uid === null && (dtKeys.indexOf(dm.echoSexUid ) > -1) && (d.dx === dm.echoIndicatorUid)){
                    return dm;
                }
                // Default
                else if(dm.echoSexUid === null && dm.echoAgeGroupUid === null && dm.lessThan15AndAbove15Uid === null && (dtKeys.indexOf(dm.defaultUid ) === -1) && (d.dx === dm.echoIndicatorUid) && dm.defaultUid !== null){
                    return dm;
                }
                // <15 and 15+
                else if(dm.echoSexUid === null && dm.defaultUid === null && dm.echoAgeGroupUid === null && (dtKeys.indexOf(dm.lessThan15AndAbove15Uid ) > -1) && (d.dx === dm.echoIndicatorUid)){
                    return dm;
                }
                // <15 and 15+ and gender
                else if((dtKeys.indexOf(dm.echoSexUid ) > -1) && dm.defaultUid === null && dm.echoAgeGroupUid === null && (dtKeys.indexOf(dm.lessThan15AndAbove15Uid ) > -1) && (d.dx === dm.echoIndicatorUid)){
                    return dm;
                }
                else{
                    return undefined;
                }
            }
            else{
                return undefined;
            }
        })
        d.datimDisaggregationUid = mapped?.datimDisaggregationUid;
        d.datimDisaggregation = mapped?.datimDisaggregation;
        d.datimCode = mapped?.datimCode;
        d.datimUid = mapped?.datimUid;
        d.sex = mapped?.sex;
        d.ageGroup =mapped?.ageGroup;
        d.lessThan15AndAbove15 = mapped?.lessThan15AndAbove15;
        d.echoIndicatorName = mapped?.echoIndicatorName;
        d.echoIndicatorUid = mapped?.echoIndicatorUid;
        d.frequency = mapped?.frequency;
        return d;
    }).filter(Boolean).filter(String);
}
/**
 * Get table headers
 * @param {*} data 
 * @returns 
 */
 export const getTableColumns =(data)=>{
    let checkObj = [];
    if(Array.isArray(data) && !isEmpty(data)){
        data.forEach((acc)=>{
            if(isPlainObject(acc)){
                Object.entries(acc).forEach(([k,val])=>{
                    if (isPlainObject(val)){
                       // checkObj = Object.keys(val)?.map((ki)=> `${ k}.${ki}`);
                    }
                    else if (Array.isArray(val)){
                        //pass
                    }
                    else{
                        checkObj.push(k);
                    }
                });
            }
            else{
                // skip
            }
        });
    }
    return uniq(checkObj);
}
export const getTableColumns1 =(data)=>{
    if(Array.isArray(data)){
        return data?.reduce((acc,cur)=>{
            let checkObj = [];
            if(isPlainObject(cur)){
                Object.entries(cur).forEach(([k,val])=>{
                    console.log("K:",k,"val:",val)
                    if (isPlainObject(val)){
                        checkObj = Object.keys(val)?.map((ki)=> `${ k}.${ki}`);
                    }
                    else if (Array.isArray(val)){
                        //pass
                    }
                    else{
                        checkObj.push(k);
                    }
                });
            }
            else{
                // skip
            }

            return [...new Set([...acc,...checkObj])];
        },[]);
    }
    else{
        return [];
    }
}
/**
 * Export data to Excel
 * @param {*} data 
 * @param {*} cols 
 * @param {*} options 
 * @param {*} filename 
 * @param {*} name 
 */
export const exportDataToExcel=(data,cols,options={ bookType:'xlsx',compression: true },filename="Excel Report",name="DATIM Import")=>{
    console.log("cols:",cols);

    const merges = [];
    let totalSpan = 0;
    let row1 = {};
    let row2 = {};

    if(!Array.isArray(cols)) {
        cols = [];
    }
    cols.forEach((c,i) => {
        const row1span = c?.spanFields?.split(',')??[];
        console.log("rowspan:",row1span);
        if((c?.row === 1) || (c?.row === '1')){    
            if(!isEmpty(row1span)){
                merges.push({
                    s: { r:0, c:((c?.order??i)+ totalSpan) }, 
                    e: { r:0, c:((c?.order??i)+ row1span.length) }
                });
                row1span.forEach((rowField,_indx)=>{
                    row2[rowField] = rowField;                   
                })
            }
            row1[c?.field]=c?.name??c?.field;
        }
        else{
            row2[c?.field]=c?.name??c?.field;
        }
        totalSpan = totalSpan + row1span.length;
    });
    data.unshift(row2);
    data.unshift(row1);
    const columnHeaders = cols?.map((col)=>col?.name??col?.field);
    //const merge = { s: {r:0, c:0}, e: {r:0, c:1} }; //A1:B1
    // Generate worksheet and workbook
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, name);
      /* fix headers */
    utils.sheet_add_aoa(ws, [columnHeaders], { origin: "A1" });

    /* calculate column width */
    const max_width = data.reduce((w, r) => Math.max(w, r.name.length), 10);
    ws["!cols"] = [ { wch: max_width } ];

    writeFileXLSX(wb, `${filename}.xlsx`, options);
    console.log("Columns for Sheet:",ws['!cols'],"dR:",data);
}
/**
 * Get indicator Groups dimensions
 * @param {*} data 
 * @param {*} key 
 * @returns 
 */
export const getIndicatorDimensions=(data,key,dimension='INDICATOR_GROUP')=>{
    if(!isEmpty(data)){
        return data.map((dv)=>{
            if(((dimension ==='INDICATOR_GROUP') || dv?.type ==='INDICATOR_GROUP') && dv.hasOwnProperty(key)){
                return `IN_GROUP-${dv?.[key]}`
            }
            else if(((dimension ==='DATA_ELEMENT_GROUP')  || dv?.type ==='DATA_ELEMENT_GROUP') && dv.hasOwnProperty(key)){
                return `DE_GROUP-${dv?.[key]}`
            }
            else{
                return dv?.[key];
            }            
        }).filter(Boolean).filter(String);
    }
    else{
        return [];
    }
}