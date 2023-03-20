import { isEmpty, minBy } from 'lodash';
import { 
    aiGetDataFrame,
    aiGetColumns,
    getDataColumns,
    getOuNameHierarchy,
    getOuLevelColumns,
    createMoreColumns,
    mergeColumnsAndData,
    nativeMerge,
    nativeRenameLabels,
    nativeDropLabels,
    nativeAddLabels,
    nativeSelectByDropColumns,
} from './utils';

export const getDataTable = (props)=>{
    const {
        ts,
        data,
        mapping,
        levels,
        mechanism,
        key,
        maxLevel
    } = props;
    // Start of ML 
    const dataSet = JSON.parse(data??'[]');
    let loading = true;
    const start= performance.now();
    if(dataSet?.rows && !isEmpty(dataSet?.rows)){
        const dataColumns = getDataColumns(dataSet?.headers);
        const addColumnsToData = mergeColumnsAndData(dataSet?.rows,dataColumns);
        const maxLevels = minBy(JSON.parse(levels??'[]'),'level')?.level;
        const ouNameHierarchy = getOuNameHierarchy(dataSet?.metaData?.ouNameHierarchy,maxLevel,(maxLevel === maxLevels));
        const aiOuHierarchy = nativeRenameLabels(ouNameHierarchy,getOuLevelColumns(JSON.parse(levels??'[]')));
        const mappingDs = JSON.parse(mapping??'[]');
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
        const mergeData = nativeMerge(addColumnsToData,aiTsRenamed,['ou']);
        let aiTsColumns =['category','type','name','categoryType','frsSourceSystem','resourceType'];
        const aiSelected = nativeDropLabels(mergeData,aiTsColumns);// Redo
        const aiAddHiererachy = nativeMerge(aiSelected,aiOuHierarchy,['ou'],'left');
        const renamed = nativeRenameLabels(aiAddHiererachy,[
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
                const mergeGender = nativeMerge(renamed,mappingDs,['EchoIndicatorUid','EchoGenderCatOptionUid'])
                aiMergeTsDataMech = mergeGender;
                break;
            case 'ageGroup':
                const mergeAgeGroup = nativeMerge(renamed,mappingDs,['EchoIndicatorUid','EchoAgeGroupCatOptionUid'])
                aiMergeTsDataMech = mergeAgeGroup;
                break;
            case 'genderAgeGroup':
                const mergeGengerAgeGroup = nativeMerge(renamed,mappingDs,['EchoIndicatorUid','EchoGenderCatOptionUid','EchoAgeGroupCatOptionUid'])
                aiMergeTsDataMech = mergeGengerAgeGroup;
                break;
            case 'lessThan15AndAbove15':
                const mergeLessThan15AndAbove15 = nativeMerge(renamed,mappingDs,['EchoIndicatorUid','EchoAgeGroupLessThan15AndAbove15Uid'])
                aiMergeTsDataMech = mergeLessThan15AndAbove15;
                break;
            case 'lessThan15AndAbove15AndGender':
                const mergeLessThan15AndAbove15AndGender = nativeMerge(renamed,mappingDs,['EchoIndicatorUid','EchoGenderCatOptionUid','EchoAgeGroupLessThan15AndAbove15Uid'])
                aiMergeTsDataMech = mergeLessThan15AndAbove15AndGender;

                break;
            default:
                const mergeDefault = nativeMerge(renamed,mappingDs,['EchoIndicatorUid'])
                aiMergeTsDataMech = mergeDefault ;
                
        }        
        // Add mechanism
        const aiMergeTsDataId = nativeAddLabels(aiMergeTsDataMech,'Mechanism',mechanism);
        const aiMergeTsDataX = nativeSelectByDropColumns(aiMergeTsDataId,['EchoIndicatorUid','EchoIndicatorName','Period','EchoOrgUnitUid','EchoOrgUnitName','Value','DatimOrgUnitUid','DatimDataElementUid','DatimDataElementCode','DatimDisaggregationUid','DatimDisaggregationName','Mechanism','Country','Province','District']);
        const aiMergeTsData = aiGetDataFrame(aiMergeTsDataX);
        const aiColumns = createMoreColumns([],aiGetColumns(aiMergeTsData));
        const aiDataDup = aiMergeTsData?aiMergeTsData.dropDuplicates():null;
        // End of ML analysis
        const end= performance.now();
        console.log("ML Took:", (end-start)/1000);
        return JSON.stringify({
            loading: false,
            data: aiDataDup?aiDataDup.toCollection():[],
            columns: aiColumns
        });
    }
    return JSON.stringify({
        loading: loading,
        data: [],
        columns: []
    })
}
