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
    nativeMerge,
    nativeRenameLabels,
} from './utils';

export const getDataTable = (props)=>{
    const {
        ts,
        data,
        mapping,
        levels,
        mechanism,
        key
    } = props;
    // Start of ML 
    const dataSet = JSON.parse(data??'[]');
    let loading = true;
    const start= performance.now();
    if(dataSet?.rows && !isEmpty(dataSet?.rows)){
        const dataColumns = getDataColumns(dataSet?.headers);
        const addColumnsToData = mergeColumnsAndData(dataSet?.rows,dataColumns) 
        const ouNameHierarchy = getOuNameHierarchy(dataSet?.metaData?.ouNameHierarchy);
        //const aiData = aiGetDataFrame(addColumnsToData);
        const aiOuHierarchy = nativeRenameLabels(ouNameHierarchy,getOuLevelColumns(JSON.parse(levels??'[]')));
        const aiOuHierarchyRename = aiGetDataFrame(aiOuHierarchy);
        const mappingDs = aiGetDataFrame(JSON.parse(mapping));
       // const aiTs = aiGetDataFrame(); //use ts
        const aiTsRenamed = nativeRenameLabels(JSON.parse(ts??'[]'),[
                {
                    old: "id", 
                    new: "ou"
                },
                {
                    old:"dhis2Name",
                    new: "EchoOrgUnitName"
                },
                {
                    old:"datimId",
                    new: "DatimOrgUnitUid"
                },
            ]
        );
        const mergeData = aiGetDataFrame(nativeMerge(addColumnsToData,aiTsRenamed,['ou']));
        //const mergeData = aiMergedDataSets(aiData,aiTsRenamed,['ou'],'left');
        let aiTsColumns =['category','type','name','categoryType','frsSourceSystem','resourceType'];
        const aiSelected = dropMultiColumns(mergeData,aiTsColumns);
        const aiAddHiererachy = aiMergedDataSets(aiSelected,aiOuHierarchyRename,['ou'],'left');
        const renamed = renameDataColumns(aiAddHiererachy,[
            {
                old:"dx",
                new:"EchoIndicatorUid",
            },
            {
                old:"ou",
                new:"EchoOrgUnitUid",
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
                const mergeGender = nativeMerge(renamed?renamed.toCollection():[],mappingDs?mappingDs.toCollection():[],['EchoIndicatorUid','EchoGenderCatOptionUid'])
                aiMergeTsDataMech = aiGetDataFrame(mergeGender);
                break;
            case 'ageGroup':
                const mergeAgeGroup = nativeMerge(renamed?renamed.toCollection():[],mappingDs?mappingDs.toCollection():[],['EchoIndicatorUid','EchoAgeGroupCatOptionUid'])
                aiMergeTsDataMech = aiGetDataFrame(mergeAgeGroup);
                break;
            case 'genderAgeGroup':
                const mergeGengerAgeGroup = nativeMerge(renamed?renamed.toCollection():[],mappingDs?mappingDs.toCollection():[],['EchoIndicatorUid','EchoGenderCatOptionUid','EchoAgeGroupCatOptionUid'])
                aiMergeTsDataMech = aiGetDataFrame(mergeGengerAgeGroup);
                break;
            case 'lessThan15AndAbove15':
                const mergeLessThan15AndAbove15 = nativeMerge(renamed?renamed.toCollection():[],mappingDs?mappingDs.toCollection():[],['EchoIndicatorUid','EchoAgeGroupLessThan15AndAbove15Uid'])
                aiMergeTsDataMech = aiGetDataFrame(mergeLessThan15AndAbove15);
                break;
            case 'lessThan15AndAbove15AndGender':
                const mergeLessThan15AndAbove15AndGender = nativeMerge(renamed?renamed.toCollection():[],mappingDs?mappingDs.toCollection():[],['EchoIndicatorUid','EchoGenderCatOptionUid','EchoAgeGroupLessThan15AndAbove15Uid'])
                aiMergeTsDataMech = aiGetDataFrame(mergeLessThan15AndAbove15AndGender);

                break;
            default:
                const mergeDefault = nativeMerge(renamed?renamed.toCollection():[],mappingDs?mappingDs.toCollection():[],['EchoIndicatorUid'])
                aiMergeTsDataMech = aiGetDataFrame(mergeDefault);
                
        }        
        // Add mechanism
        const aiMergeTsDataId = aiAddColumn(aiMergeTsDataMech,'Mechanism',mechanism);
        const aiMergeTsData = aiSelectByDropColumns(aiMergeTsDataId?aiMergeTsDataId.chain(
            (row,i)=>row.set('id',i+1)
        ):null,['id','EchoIndicatorUid','Period','EchoOrgUnitUid','EchoOrgUnitName','Value','DatimOrgUnitUid','DatimDataElementUid','DatimDisaggregationUid','Mechanism','Country','Province','District']);
        const aiColumns = createMoreColumns([],aiGetColumns(aiMergeTsData));
        // End of ML analysis
        const end= performance.now();
        console.log("ML Took:", (end-start)/1000);
        return JSON.stringify({
            loading: false,
            data: aiMergeTsData?aiMergeTsData.toCollection():[],
            columns: aiColumns
        });
    }
    return JSON.stringify({
        loading: loading,
        data: [],
        columns: []
    })
}
