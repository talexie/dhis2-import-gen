import { isEmpty } from "lodash";
import { DataFrame } from 'dataframe-js';

/**
 * Check if dataframe has a column
 * @param {*} columns 
 * @param {*} key 
 * @returns 
 */
export const hasColumn =(columns,key)=>columns?.some((d)=>(d===key));
/**
 * Check if an array is a subset of the other
 * @param {*} parentArray 
 * @param {*} subsetArray 
 * @returns 
 */
export const isArraySubSet = (parentArray, subsetArray) => {
    const set = new Set(parentArray);
    return subsetArray.every(x => set.has(x));
}

/**
 * Get Dataframe from JSON object
 * @param {*} data 
 * @param {*} columns 
 * @returns 
 */
export const aiGetDataFrame = (data=[],columns=[])=>{

    if(!isEmpty(columns && !isEmpty(data) && data?.length > 0 && data !== null)){
        return new DataFrame(data, columns);
    }
    else if(!isEmpty(data) && data?.length > 0  && data !== null){
        return new DataFrame(data);
    }
    return null;
}
/**
 * Merge two datasets of data
 * @param {*} dfLeft 
 * @param {*} dfRight
 * @param {*} on 
 * @param {*} how 
 * @returns 
 */
export const aiMergedDataSets =(dfLeft,dfRight,on=['id'],how='left')=>{
    if(dfLeft && dfLeft !== null && dfRight && dfRight !== null){
        if( isArraySubSet(dfLeft.listColumns(),on) && isArraySubSet(dfRight.listColumns(),on)){
            return dfLeft.join(dfRight, on, how);
        }
        return dfLeft;
    }
    return null;
   
}
/**
 * Rename labels on a dataset
 * @param {*} df 
 * @param {*} oldLabel
 * @param {*} label
 * @returns 
 */
export const aiRenameLabels = (df,oldLabel="",label="RenamedColumn")=>{
    if(df && df !== null){
        if(hasColumn(df.listColumns(),oldLabel)){
            return df.rename(oldLabel,label);
        }
        return df;
    }
    return null;
}
/**
 * Drop columns on a dataset
 * @param {*} df 
 * @param {*} label 
 * @returns 
 */
export const aiDropColumns =(df,label)=>{
    if(df && df !== null){
        if(hasColumn(df.listColumns(),label)){
            return df.drop(label);
        }
        return df;
    }
    return null;
}
export const aiSelectByDropColumns =(df,columns=[])=>{
    if(df && df !== null){
        const dfColumns = df.listColumns();
        const set = new Set(columns);
        return dfColumns.reduce((curr,label)=>{
            if(!set.has(label)){
                return aiDropColumns(curr,label);
            }
            return curr;    
        },df);
    }
    return null;
}
/**
 * Get unique values in a column
 * @param {*} df 
 * @param {*} column
 * @returns 
 */
export const aiGetUniqueInColumn =(df,column="")=>{
    if(df  && df !== null){
        if(hasColumn(df.listColumns(),column)){
            return df.unique(column);
        }
        return null;
    }
    return null;
}
/**
 * Combine two columns to one
 * @param {*} df 
 * @param {*} colName 
 * @param {*} col1 
 * @param {*} col2 
 * @param {*} sep 
 * @returns 
 */
export const aiConcatColumn = (df,colName="AddColumnName",col1,col2,sep="")=>{
    if(df  && df !== null){
        if(hasColumn(df.listColumns(),col1) && hasColumn(df.listColumns(),col2)){
            df.withColumn(colName, (row) => row.get(col1)+sep+row.get(col2));
        }
        return df;
    }
    return null;
}
/**
 * Add a column to data frame
 * @param {*} df 
 * @param {*} colName 
 * @param {*} value 
 * @returns 
 */
export const aiAddColumn = (df,colName="AddColumnName",value="")=>{
    if(df  && df !== null){
        return df.withColumn(colName, () => value);
    }
    return null;
}
/**
 * Replace value
 * @param {*} df 
 * @param {*} column 
 * @param {*} value 
 * @returns 
 */
export const aiReplaceNull = (df,column=[],value="NULL_OR_UNDEFINED")=>{
    if(df  && df !== null){
        if(isArraySubSet(df.listColumns(),column)){
            return df.fillMissingValues(value,column);
        }
        return df;
    }
    return null;
}
/**
 * Select data frame with strict columns
 * @param {*} df 
 * @param {*} columns 
 * @returns 
 */
export const aiSelectColumns =(df,columns=[])=>{
    if(df && df !== null){
        if(isArraySubSet(df.listColumns(),columns)){
            const colMap = columns??[];
            if(colMap.length > 0){
                return df.select(JSON.stringify(columns??[]).replace("[","").replace("]",""));
            }
            return df;
        }
        return df;
    }
    return null; 
}
/**
 * Filter rows in a dataframe
 * @param {*} df 
 * @param {*} query 
 * @returns 
 */
export const aiFilterRows = (df,query={})=>{
    if(df  && df !== null){
        return df.filter(query);
    }
    else{ 
        return null;
    }
}
/**
 * Get Columns of the dataframe
 * @param {*} df 
 * @returns 
 */
export const aiGetColumns =(df)=>{
    if(df  && df !== null){
        return df.listColumns();  
    }
    return null;
}
/**
 * Get n records
 * @param {*} df 
 * @param {*} n 
 * @returns 
 */
export const aiShowData = (df,n=5) =>{
    if(df  && df !== null){
        return df.show(n);
    }
    return null;
}