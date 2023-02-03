import { isEmpty } from 'lodash';
import { 
    aiGetDataFrame,
    aiGetColumns,
    getDataColumns,
    renameDataColumns,
    aiMergedDataSets,
    dropMultiColumns,
    getOuNameHierarchy,
    getOuLevelColumns,
    createMoreColumns,
    aiAddColumn,
    aiSelectByDropColumns,
    mergeColumnsAndData,
    aiShowData
} from './utils';


export const getDataTable = (
    ts,
    data,
    mapping,
    levels,
    mechanism,
    key
)=>{
    // Start of ML 
    const dataSet = JSON.parse(data);
    
    let loading = true;
    if(dataSet?.rows && !isEmpty(dataSet?.rows)){
        const dataColumns = getDataColumns(dataSet?.headers);
        const addColumnsToData = mergeColumnsAndData(dataSet?.rows,dataColumns) 
        const ouNameHierarchy = getOuNameHierarchy(dataSet?.metaData?.ouNameHierarchy);
        const aiData = aiGetDataFrame(addColumnsToData);
        const aiOuHierarchy = aiGetDataFrame(ouNameHierarchy);
        
        const aiOuHierarchyRename = renameDataColumns(aiOuHierarchy,getOuLevelColumns(JSON.parse(levels)));

        const mappingDs = aiGetDataFrame(JSON.parse(mapping));
        const aiTs = aiGetDataFrame(JSON.parse(ts)); //use ts
        const aiTsRenamed = renameDataColumns(aiTs,[
            {
                old: "id", 
                new: "ou"
            }]
        );
        const mergeData = aiMergedDataSets(aiData,aiTsRenamed,['ou'],'left');
        let aiTsColumns =['category','type','name','categoryType','frsSourceSystem','resourceType'];
        const aiSelected = dropMultiColumns(mergeData,aiTsColumns);
        const aiAddHiererachy = aiMergedDataSets(aiSelected,aiOuHierarchyRename,['ou'],'left');
        const renamed = renameDataColumns(aiAddHiererachy,[
            {
                old:"dx",
                new:"EchoIndicatorID",
            },
            {
                old:"ou",
                new:"EchoOrgUnit",
            },
            {
                old:"pe",
                new:"Period",
            },
            {
                old: "FSptXcFjcvi",
                new: "EchoGenderCatOptionUid"


            },
            {
                old:"dGlXlgOZKm3",
                new: "EchoAgeGroupCatOptionUid"
            },
            {
                old:"r7fzO9tznR3",
                new: "EchoAgeGroupLessThan15AndAbove15Uid"
            },
            {
                old:"value",
                new: "Value"
            }
        ]);
        let aiMergeTsDataMech = null;
        switch (key){
            case 'gender':
                aiMergeTsDataMech = aiMergedDataSets(renamed,mappingDs,['EchoIndicatorID','EchoGenderCatOptionUid'],'left');
                break;
            case 'ageGroup':
                aiMergeTsDataMech = aiMergedDataSets(renamed,mappingDs,['EchoIndicatorID','EchoAgeGroupCatOptionUid'],'left');
                break;
            case 'genderAgeGroup':
                aiMergeTsDataMech = aiMergedDataSets(renamed,mappingDs,['EchoIndicatorID','EchoGenderCatOptionUid','EchoAgeGroupCatOptionUid'],'left');
                break;
            case 'lessThan15AndAbove15':
                aiMergeTsDataMech = aiMergedDataSets(renamed,mappingDs,['EchoIndicatorID','EchoAgeGroupCatOptionUid'],'left');
                break;
            case 'lessThan15AndAbove15AndGender':
                aiMergeTsDataMech = aiMergedDataSets(renamed,mappingDs,['EchoIndicatorID','EchoGenderCatOptionUid','EchoAgeGroupLessThan15AndAbove15Uid'],'left');
                break;
            default:
                aiMergeTsDataMech = aiMergedDataSets(renamed,mappingDs,['EchoIndicatorID'],'left');
                
        }        
        // Add mechanism
        const aiMergeTsDataId = aiAddColumn(aiMergeTsDataMech,'Mechanism',mechanism);
        const aiMergeTsData = aiSelectByDropColumns(aiMergeTsDataId?aiMergeTsDataId.chain(
            (row,i)=>row.set('id',i+1)
        ):null,['id','EchoIndicatorID','Period','EchoOrgUnit','Value','datimId','datimUid','datimDisaggregationUid','Mechanism','level4','level5','level6']);
        const aiColumns = createMoreColumns([],aiGetColumns(aiMergeTsData));
        loading = false;
        // End of ML analysis

        return JSON.stringify({
            loading: loading,
            data: aiMergeTsData?aiMergeTsData.toCollection():[],
            columns: aiColumns
        })
    }
    else{
        return(JSON.stringify({
            loading: false,
            data: [],
            columns: []
        }));
    }
}


export const performCalculation =(data)=> {
    console.log(`Worker lives!:`,data);
    return data;
}  
