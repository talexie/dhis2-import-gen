import { read, utils, write } from 'xlsx';
import get from 'lodash/get';
import uniq from 'lodash/uniq';
import { aiGetDataFrame, nativeAddLabelValue, nativeDropLabels, nativeMerge,nativeRenameLabels, nativeAddLabels, toValue } from './utils';
import { format } from 'date-fns';
import concat from 'lodash/concat';

export const trainingMap = [
    {old:"Event_ID",new:"NbY39IsysW8"},
    {old:"Findname",new:"zpbuh92IZv5"},
    {old:"Participant_ID",new:"PnTyfCzi21U"},
    {old:"Participant_enroll_type",new:"ZbV6b9nyjEA"},
    {old:"_ComputedKey",new:"zPurCMBL0Nu"},
    {old:"Event_USAID_IR",new:"RhvGRpZugO3"},
    {old:"Event_USAID_SubIR",new:"OjJycXuMuZk"},
    {old:"Event_USAID_ACT",new:"GvmIaOBA03d"},
    {old:"Event_MOU_SO",new:"lUy2eqH1sEJ"},
    {old:"Event_MOU_SubSO",new:"KzMfUxbeFzD"},
    {old:"Event_MOU_ACT",new:"Cy318oojbdQ"},
    {old:"Event_MOU_and_Ncode",new:"fcu3uzzjyKs"},
    {old:"Event_location",new:"PRGOGappybO"},
    {old:"Event_Province_ECHO",new:"MecFf6Wq7LR"},
    {old:"Event_District_ECHO",new:"n0ShOa0FxbX"},
    {old:"Event_Other_Location",new:"iagm7CqAJJh"},
    {old:"Event_name",new:"rl6qyAcUs38"},
    {old:"Event_Domain",new:"Vage2qvHXd0"},
    {old:"Event_Activity_topic",new:"TFC0Rw839uT"},
    {old:"Event_type",new:"vzTfKRtECRq"},
    {old:"Event_Internal_Project",new:"VEP9Sw6YF8n"},
    {old:"Event_USAID_report_FOR_TRAINING_INDICATOR_ONLY",new:"LQtnBdLYXpt"},
    {old:"Event_MOU_report",new:"c0AabYVBn3m"},
    {old:"Event_Organizer_by",new:"U5ObMxm5NK8"},
    {old:"Event_level",new:"UdE4lSfvq3g"},
    {old:"Event_Topic_areas",new:"FlgUIrpzdAk"},
    {old:"Event_Topic_areas_by_SO",new:"llmn6FOCToG"},
    {old:"Event_Start_date",new:"gc5xwL8Iov7"},
    {old:"Event_End_date",new:"XRg8WWy75xH"},
    {old:"Total_number_of_participants",new:"ItA7s4eRtgD"},
    {old:"Total_number_of_female_participants",new:"n3E7I8XIsGW"},
    {old:"Was_the_event_engage_a_large_number_of_participants",new:"YOIw7kXDTCB"},
    {old:"Participant_Name",new:"SQ1xgm6PPJA"},
    {old:"Participant_Surname",new:"liQTjxYq72E"},
    {old:"Participant_Gender",new:"fe1F4nvTxPX"},
    {old:"Participant_Province_ECHO",new:"jKpfUlsauCD"},
    {old:"Participant_District_ECHO",new:"lXstk077AsZ"},
    {old:"Participant_work_village",new:"EpxTg68OtYJ"},
    {old:"Participant_Official_Position",new:"TwqvBE6IVxN"},
    {old:"Participant_Cleaned_Positions",new:"uE16E2Rnx16"},
    {old:"Participant_Responsible_unit",new:"B4mCRObggzm"},
    {old:"Participant_Organization_Name",new:"JvQcAg9kiUH"},
    {old:"Participant_Organization_type",new:"EIwXld7Sc9o"},
    {old:"Participant_Organization_Level",new:"M2mQBNAhYwW"},
    {old:"Participant_Contact_Number",new:"pOKzZubB27Y"},
    {old:"Participant_WhatsApp_number",new:"InTacvgZhpW"},
    {old:"Event_USAID_Type",new:"Q2XqijFJnIr"},
    {old:"Event_USAID_Domain",new:"Kfc4bffUKU2"},
    {old:"Event_USAID_Indicator",new:"cwp2WfIfxKj"},
    {old:"Event_MOU_Type",new:"xpUsddrA1TP"},
    {old:"Event_host",new:"Ma6dFGkAwoY"}
    
];
export const createDhis2Import =(file)=>{
    const wb = read(file,{ cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const dataWs = getMergeValue(ws);
    const data = utils.sheet_to_json(dataWs, { header: "A" });
    const tblData = utils.sheet_to_html(ws);
    return {
        data: data,
        table: tblData
    }
}
export const rangeContainsAddr=(range, addr)=> { 
    if(typeof addr == "string") addr = utils.decode_cell(addr);
    if(typeof range == "string") range = utils.decode_range(range);
    return range.s.r <= addr.r && range.s.c <= addr.c && range.e.c >= addr.c && range.e.r >= addr.r;
}
export const getCellObject =(ws,target_cell)=>{
    var merge = ws["!merges"].find((merge)=>{ 
        return rangeContainsAddr(merge, target_cell); 
    });
    
    var actual_address = merge ? merge.s : target_cell; // the actual address of the cell object
    
    var base_cell = ws[utils.encode_cell(actual_address)]; // cell object
    return base_cell;
}
/**
 * Merge by column
 * @param {*} ws 
 * @param {*} col 
 * @returns 
 */
export const getMergeValue =(ws,col=1)=>{
    let temp = "";
    const m = utils.decode_range(ws['!ref']);
    for(let r=m.s.r;r<=m.e.r;r++){
        const v = ws[utils.encode_cell({ c:col,r:r})];
        if(v){
            temp = v;
        }
        else{
            ws[utils.encode_cell({ c:col,r:r})] = temp;
        }
    }
    return ws;
}

/**
   * Fill cell from a Worksheet that was merged
   * @param {WorkSheet} ws -Worksheet that will be filled
   */
export const fillMerges=(ws)=>{
    const merges = ws['!merges'];
    const mergesMap = merges?.map((merge) => ({
      start: utils.encode_cell(merge?.s),
      end: utils.encode_cell(merge?.e),
    }));
    for (const merge of mergesMap) {
      const cells = getCellsForHorizontalRange(merge);
      if (ws[merge?.start]) {
        const cellValue = get(ws, merge?.start);
        for (const newCell of cells) {
          ws[newCell] = cellValue;
        }
      }
    }
    return ws;
}
/**
   * Compute the next column name for a xls file
   * @example
   * // returns B
   * getNextColumn('A');
   * @example
   * // returns AA
   * getNextColumn('Z');
   * @param {String} column - Xls file column name
   * @returns next column name
   */
export const getNextColumn=(column)=> {
    let nextColumn = column.substring(0, column.length - 1) + String.fromCharCode(column.charCodeAt(column.length - 1) + 1);
    // next char after 'Z'
    if (nextColumn[nextColumn.length - 1] === '[') {
      const arr = nextColumn.split('');
      arr.pop();
      nextColumn = arr.join().concat('AA');
    }

    return nextColumn;
  }

  /**
   * Create a array of cell names in the same row based on range of merged cells
   * @param merge - A range of merged cells
   * @returns {string[]} Array of cell names
   */
export const getCellsForHorizontalRange=(merge)=> {
    const row = merge.start.match(/\d+/)[0];
    const startCol = merge.start.match(/[A-Z]{1,2}/)[0];
    const endCol = merge.end.match(/[A-Z]{1,2}/)[0];
    const cells = [merge.start];
    if (startCol.localeCompare(endCol) === 0) return cells;

    let nextColumn =getNextColumn(startCol);
    while (nextColumn.localeCompare(endCol) === -1) {
      cells.push(nextColumn + row);
      nextColumn = getNextColumn(nextColumn);
    }
    cells.push(endCol + row);

    return cells;
}

/**
 * Create DHIS2 Payload
 * @param {*} data 
 * @param {*} period 
 * @param {*} orgUnit 
 * @param {*} aoc 
 * @returns 
 */
export const createDhis2Payload=(data,mapping,period,orgUnit,aoc,isLegacy=false)=>{
    const renameKeys = isLegacy?
    [
        {
            old:"B",
            new: "SMARTCAREIndicator"
        },
        {
            old:"C",
            new: "SMARTCAREIndicatorLegacyLabel"
        }
    ]:[
        {
            old:"B",
            new: "SMARTCAREIndicator"
        },
        {
            old:"C",
            new: "SMARTCAREIndicatorLabel"
        }
    ]
    const renamedData = nativeRenameLabels(data,renameKeys);
    const mergeKeys = isLegacy?['SMARTCAREIndicator','SMARTCAREIndicatorLegacyLabel']:['SMARTCAREIndicator','SMARTCAREIndicatorLabel']
    const mergedData = nativeMerge(renamedData,mapping,mergeKeys);
    const renameMergedData = nativeRenameLabels(mergedData,[
        {
            old:"F",
            new: "value"
        },
        {
            old:"ECHODataElementUID",
            new: "dataElement"
        },
        {
            old:"ECHOCategoryOptionComboUID",
            new: "categoryOptionCombo"
        }
    ]);
    const filteredData = renameMergedData?.filter((f)=>Object.hasOwn(f,'dataElement') && Object.hasOwn(f,'categoryOptionCombo') && get(f,'dataElement') && get(f,'categoryOptionCombo') && (toValue(get(f,'value')) > -1));
    const txNo50Data = filteredData?.filter((d)=>d?.['dataElement'] !== "V9CDyyQLlzG" );
    const tx50Data = filteredData?.filter((d)=>d?.['dataElement'] === "V9CDyyQLlzG" );
    const txNewData = getTxNew(tx50Data,orgUnit,period,aoc);
    const otherData = txNo50Data.concat(txNewData);
    return otherData?.map((d)=>{
        if(toValue(d?.['value']) || toValue(d?.['value']) === 0 ){
            if( d?.['dataElement'] === "V9CDyyQLlzG" ){
                if((period?.includes('03') ||  period?.includes('06') || period?.includes('09') || period?.includes('12'))){
                    return undefined;
                }
            }
            return {
                orgUnit : orgUnit,
                period :period,
                attributeOptionCombo: aoc,
                value: toValue(d?.['value']),
                dataElement: d?.['dataElement'],
                categoryOptionCombo: d?.['categoryOptionCombo']
            }

        }
        else{
            return undefined;
        }
    }).filter(Boolean).filter(String);
}
export const getTxNew =(data,orgUnit,period,aoc)=>{
    const tx50dataMale = data?.filter((d)=>((d?.['dataElement'] === "V9CDyyQLlzG" ) && (d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 50-54 Male") || (d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 55-59 Male") || (d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 60-64 Male") || (d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 65+ Male") || (d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 50+ Male")));

    const tx50dataFemale = data?.filter((d)=>((d?.['dataElement'] === "V9CDyyQLlzG" ) && (d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 50-54 Female") || (d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 55-59 Female") || (d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 60-64 Female") || (d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 65+ Female") || (d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 50+ Female")));

    const tx50dataBefore = data?.filter((d)=>((d?.['dataElement'] === "V9CDyyQLlzG" ) && !((d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 50-54 Male") || (d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 55-59 Male") || (d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 60-64 Male") || (d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 65+ Male") || (d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 50-54 Female") || (d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 55-59 Female") || (d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 60-64 Female") || (d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 65+ Female") || (d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 50+ Male") || (d?.['SMARTCAREIndicatorLabel']?.trim()==="By Age/Sex: 50+ Female"))));
    
    const maleTx = {
        orgUnit : orgUnit,
        period :period,
        attributeOptionCombo: aoc,
        value: getTxSum(tx50dataMale,period),
        dataElement: 'V9CDyyQLlzG',
        categoryOptionCombo: 'cN7C77eDU4T'
    }
    const femaleTx = {
        orgUnit : orgUnit,
        period :period,
        attributeOptionCombo: aoc,
        value: getTxSum(tx50dataFemale,period),
        dataElement: 'V9CDyyQLlzG',
        categoryOptionCombo: 'TkNy22uDXzK'
    }


    const txBefore = tx50dataBefore?.map((d)=>{
        if(toValue(d?.['value']) || toValue(d?.['value']) === 0 ){
            if((period?.includes('03') ||  period?.includes('06') || period?.includes('09') || period?.includes('12'))){
                return undefined;
            }
            return {
                orgUnit : orgUnit,
                period :period,
                attributeOptionCombo: aoc,
                value: toValue(d?.['value']),
                dataElement: d?.['dataElement'],
                categoryOptionCombo: d?.['categoryOptionCombo']
            }

        }
        else{
            return undefined;
        }
    }).filter(Boolean).filter(String);
    return [maleTx].concat([femaleTx]).concat(txBefore);
}

export const getTxSum =(data,period)=>{
    let sum = 0;
    data?.forEach((d)=>{
        if(toValue(d?.['value']) || toValue(d?.['value']) === 0 ){
            if((period?.includes('03') ||  period?.includes('06') || period?.includes('09') || period?.includes('12'))){
                sum += 0;
            }
            else{
                sum += toValue(d?.['value']);
            }

        }
        else{
            sum50MalePlus += 0;
        }
    });
    return sum;
}

export const uploadMapping = (file, type)=>{
    const wb = read(file,{ cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const dataWs = getMergeValue(ws);
    const data = utils.sheet_to_json(dataWs,{ defval:"" });
    if(type  ==="LOCATION"){
        const renameLocationData = nativeRenameLabels(data,[]);
        return renameLocationData;
    }
    else if(type  ==="INDICATOR"){
        const renameIndicatorData = nativeRenameLabels(data,[
            { old: 'DATIM_CODE',new:'datimCode'},
            { old: 'dataelementuid',new:'datimUid'},
            { old: 'ECHO - INDICATOR',new:'echoIndicatorName'},
            { old: 'DATIM XYZ',new:'datimXyz'},
            { old: 'HIV_STAT',new:'hivStat'},
            { old: 'Sex',new:'sex'},
            { old: 'Age Group',new:'ageGroup'},
            { old: 'categoryoptioncombo',new: 'datimDisaggregation'},
            { old: 'categoryoptioncombocode',new: 'datimDisaggregationUid'},
            { old: 'ECHO_indicatorID',new: 'echoIndicatorUid'},
            { old: 'echo_sex_uid',new:'echoSexUid'},
            { old: 'echo_agegroup_uid',new:'echoAgeGroupUid'},
            { old: 'default_uid',new:'defaultUid'},
            { old: 'less_than_15_and_above_15_uid',new:'lessThan15AndAbove15Uid'},
            { old: 'FY2020',new:'FY2020'},
            { old: 'DATABASE INDICATOR',new:'databaseIndicator'},
            { old: 'SAFE - DataElement',new:'safeDataElement'}
        ]);
        const aiAddIndicatorData = nativeAddLabelValue(renameIndicatorData,['FY23','FY22'],undefined,'BOOL');
        const aiIndicatorData = aiGetDataFrame(aiAddIndicatorData);
        const aiIndicatorDup = aiIndicatorData?aiIndicatorData.dropDuplicates():null;
        return aiIndicatorDup?aiIndicatorDup.toCollection():[];
    }
    else if(type  ==="SMARTCARE"){
        const renameSmartcareData = nativeRenameLabels(data,[
            {
                old:'Indicator label',
                new:'IndicatorLegacyLabel'
            },
            { old: 'SMARTCARE Indicator',new:'SMARTCAREIndicator'},
            { old: 'SMARTCARE Indicator Label',new:'SMARTCAREIndicatorLabel'},
            { old: 'ECHODataElementName', new:'ECHODataElementName'},
            { old: 'ECHODataElementUID', new:'ECHODataElementUID'},
            { old: 'ECHOCategoryOptionComboName', new:'ECHOCategoryOptionComboName'},
            { old: 'ECHOCategoryOptionComboName ', new:'ECHOCategoryOptionComboName '},
            { old: 'ECHOCategoryOptionComnoUID',new:'ECHOCategoryOptionComboUID'}
        ]);
        const aiSmartcareData = aiGetDataFrame(renameSmartcareData);
        const aiSmartcareDup = aiSmartcareData?aiSmartcareData.dropDuplicates():null;
        return aiSmartcareDup?aiSmartcareDup.toCollection():[];
    }
    else{
        return [];
    }

    
}
/**
 * Store file
 * @param {*} orgUnit 
 * @param {*} period 
 * @returns 
 */
export const uploadART = (orgUnit,fileId)=>{
    return {
        events:[
            {
                orgUnit: orgUnit?.id,
                occurredAt: format(new Date(),"yyyy-MM-dd"),
                completedAt: format(new Date(),"yyyy-MM-dd"),
                dataValues:[
                    {
                        dataElement:"CYHDjier8OI",
                        value: fileId?.id
                    }
                ],
                program: "j1plKUVQMq4",
                programStage: "tVKomFeeL2W",
                status: "COMPLETED"
            }
        ]
    }
}
/**
 * Get upload file
 * @param {*} orgUnit 
 * @param {*} period 
 * @returns 
 */
export const getUploadFile = (file)=>{
    const wb = read(file,{ cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const dataWs = getMergeValue(ws);
    const data = utils.sheet_to_json(dataWs, { header: "A"});
    const dropData = nativeDropLabels(data,['F']);
    const worksheet = utils.json_to_sheet(dropData, { skipHeader: true });
    wb.Sheets[wb.SheetNames[0]] = worksheet;
    return write(wb, {bookType: 'xlsx', type: 'array'});
}
/**
 * Find Element by property 
 * @param {*} data 
 * @param {*} property defaults to 'code' 
 * @returns 
 */
export const findElementByProperty =(data=[],value="",property='code',level=undefined)=>{
    if(level){
        return data?.find((ou)=>((get(ou,property) === value?.trim()) && (get(ou,'level') === level)));    
    }
    return data?.find((ou)=>get(ou,property) === value?.trim());
}

/**
 * Find Entity by attribute 
 * @param {*} data 
 * @param {*} property defaults to 'code' 
 * @returns 
 */
export const findEntityByAttribute =(data=[],value="",property='code')=>{
    return data?.find((e)=>e?.attributes?.some((attr)=>((attr?.attribute === property) && (attr.value === value?.trim()))));
}

export const mergeRecords = (records,property="trackedEntity") => {
    const mergedMap = new Map();

    records.forEach(record => {
      const key =  get(record,property);
      const te = findElementByProperty(record?.enrollments?.[0]?.attributes,'PnTyfCzi21U','attribute');
      const keyAttr = te?.value;
      if (mergedMap.has(keyAttr)) {
        const existingRecord = mergedMap.get(keyAttr);
        const mappedEvents = [...existingRecord?.enrollments?.[0].events,...record?.enrollments?.[0].events]
        const enrollments =[
            {
                ...existingRecord?.enrollments?.[0],
                events: mappedEvents
            }
        ]
        const mappedRecord = {
            ...existingRecord,
            enrollments: enrollments
        }

        mergedMap.set(keyAttr, mappedRecord);
      } 
      else {
        mergedMap.set(keyAttr,record);
      }
    });
    return Array.from(mergedMap.values());
  }
  

  

/**
 * Get Element by property 
 * @param {*} data 
 * @param {*} property defaults to 'code' 
 * @returns 
 */
export const getElementByProperty =(data,property='code')=>{
    return uniq(data?.map((ou)=>get(ou,property))?.filter(Boolean)?.filter(String));
}


/**
 * Create Tracker Payload for importing to the system
 * @param {*} data 
 * @returns 
 */
export const createTrackerDataFile=(data=[])=>{
    return nativeRenameLabels(data,trainingMap,true);
}
export const createTrackerPayload =(data=[],entities=[],orgUnits=[])=>{
    const mappedData = createTrackerDataFile(data);
    return mappedData?.map((d)=>{
        const te = findEntityByAttribute(entities,d?.PnTyfCzi21U,'PnTyfCzi21U');
        const orgUnit = findElementByProperty(orgUnits,d?.lXstk077AsZ,'shortName',5);
        const ppOrgUnit = findElementByProperty(orgUnits,d?.jKpfUlsauCD,'shortName',4);
        const epOrgUnit = findElementByProperty(orgUnits,d?.MecFf6Wq7LR,'shortName',4);
        const edOrgUnit = findElementByProperty(orgUnits,d?.n0ShOa0FxbX,'shortName',5);
        const eHostOrgUnit = findElementByProperty(orgUnits,d?.Ma6dFGkAwoY,'shortName',4);
        if(orgUnit){
            if(te){
                const enrollment = te?.enrollments?.[0];
                return ({
                    trackedEntity: te?.trackedEntity,
                    trackedEntityType: te?.trackedEntityType,
                    orgUnit: te?.orgUnit,
                    //createdAt: te?.createdAt,
                    enrollments:[
                        {
                            enrolledAt: format(new Date(enrollment?.enrolledAt),'yyyy-MM-dd'),
                            enrollment: enrollment?.enrollment,
                            orgUnit: te?.orgUnit,
                            program: "jxMMKP58LC4",
                            status: "ACTIVE",
                            trackedEntityType: te?.trackedEntityType,
                            attributes:[
                                {attribute:"zpbuh92IZv5",value: get(d,"zpbuh92IZv5")},
                                {attribute:"PnTyfCzi21U",value: get(d,"PnTyfCzi21U")},
                                {attribute:"SQ1xgm6PPJA",value: get(d,"SQ1xgm6PPJA")},
                                {attribute:"liQTjxYq72E",value: get(d,"liQTjxYq72E")},
                                {attribute:"fe1F4nvTxPX",value: get(d,"fe1F4nvTxPX")},
                                {attribute:"jKpfUlsauCD",value: ppOrgUnit?.id},
                                {attribute:"lXstk077AsZ",value: orgUnit?.id},
                                {attribute:"EpxTg68OtYJ",value: get(d,"EpxTg68OtYJ")},
                                {attribute:"TwqvBE6IVxN",value: get(d,"TwqvBE6IVxN")},
                                {attribute:"uE16E2Rnx16",value: get(d,"uE16E2Rnx16")},
                                {attribute:"B4mCRObggzm",value: get(d,"B4mCRObggzm")},
                                {attribute:"JvQcAg9kiUH",value: get(d,"JvQcAg9kiUH")},
                                {attribute:"EIwXld7Sc9o",value: get(d,"EIwXld7Sc9o")},
                                {attribute:"M2mQBNAhYwW",value: get(d,"M2mQBNAhYwW")},
                                {attribute:"pOKzZubB27Y",value: get(d,"pOKzZubB27Y")},
                                {attribute:"InTacvgZhpW",value: get(d,"InTacvgZhpW")}
                            ]?.filter((v)=>v?.value),
                            events:[
                                {
                                    occurredAt: format(get(d,"gc5xwL8Iov7"),'yyyy-MM-dd'),
                                    orgUnit: te?.orgUnit,
                                    program: "jxMMKP58LC4",
                                    programStage: "pjs7MjdYttv",
                                    status: "COMPLETED",
                                    trackedEntityType: te?.trackedEntityType,
                                    dataValues:[
                                        {dataElement:"NbY39IsysW8",value: get(d,"NbY39IsysW8")},
                                        {dataElement:"ZbV6b9nyjEA",value: get(d,"ZbV6b9nyjEA")},
                                        {dataElement:"zPurCMBL0Nu",value: get(d,"zPurCMBL0Nu")},
                                        {dataElement:"RhvGRpZugO3",value: get(d,"RhvGRpZugO3")},
                                        {dataElement:"OjJycXuMuZk",value: get(d,"OjJycXuMuZk")},
                                        {dataElement:"GvmIaOBA03d",value: get(d,"GvmIaOBA03d")},
                                        {dataElement:"lUy2eqH1sEJ",value: get(d,"lUy2eqH1sEJ")},
                                        {dataElement:"KzMfUxbeFzD",value: get(d,"KzMfUxbeFzD")},
                                        {dataElement:"Cy318oojbdQ",value: get(d,"Cy318oojbdQ")},
                                        {dataElement:"fcu3uzzjyKs",value: get(d,"fcu3uzzjyKs")},
                                        {dataElement:"PRGOGappybO",value: get(d,"PRGOGappybO")},
                                        {dataElement:"MecFf6Wq7LR",value: epOrgUnit?.id},
                                        {dataElement:"n0ShOa0FxbX",value: edOrgUnit?.id},
                                        {dataElement:"iagm7CqAJJh",value: get(d,"iagm7CqAJJh")},
                                        {dataElement:"rl6qyAcUs38",value: get(d,"rl6qyAcUs38")},
                                        {dataElement:"Vage2qvHXd0",value: get(d,"Vage2qvHXd0")},
                                        {dataElement:"TFC0Rw839uT",value: get(d,"TFC0Rw839uT")},
                                        {dataElement:"vzTfKRtECRq",value: get(d,"vzTfKRtECRq")},
                                        {dataElement:"VEP9Sw6YF8n",value: get(d,"VEP9Sw6YF8n")},
                                        {dataElement:"LQtnBdLYXpt",value: get(d,"LQtnBdLYXpt")},
                                        {dataElement:"c0AabYVBn3m",value: get(d,"c0AabYVBn3m")},
                                        {dataElement:"U5ObMxm5NK8",value: get(d,"U5ObMxm5NK8")},
                                        {dataElement:"UdE4lSfvq3g",value: get(d,"UdE4lSfvq3g")},
                                        {dataElement:"FlgUIrpzdAk",value: get(d,"FlgUIrpzdAk")?.split(",")?.map((t)=>t?.trim())?.join(",")},
                                        {dataElement:"llmn6FOCToG",value: get(d,"llmn6FOCToG")?.split(",")?.map((t)=>t?.trim())?.join(",")},
                                        {dataElement:"gc5xwL8Iov7",value: format(get(d,"gc5xwL8Iov7"),'yyyy-MM-dd')},
                                        {dataElement:"XRg8WWy75xH",value: format(get(d,"XRg8WWy75xH"),'yyyy-MM-dd')},
                                        {dataElement:"ItA7s4eRtgD",value: get(d,"ItA7s4eRtgD")},
                                        {dataElement:"n3E7I8XIsGW",value: get(d,"n3E7I8XIsGW")},
                                        {dataElement:"YOIw7kXDTCB",value: get(d,"YOIw7kXDTCB")},
                                        {dataElement:"Q2XqijFJnIr",value: get(d,"Q2XqijFJnIr")},
                                        {dataElement:"Kfc4bffUKU2",value: get(d,"Kfc4bffUKU2")},
                                        {dataElement:"cwp2WfIfxKj",value: get(d,"cwp2WfIfxKj")},
                                        {dataElement:"xpUsddrA1TP",value: get(d,"xpUsddrA1TP")},
                                        {dataElement:"Ma6dFGkAwoY",value: eHostOrgUnit?.id}

                                    ]?.filter((v)=>v?.value)
                                }
                            ]       
    
                        }
                    ]
                })
            }
            else{
                return ({
                    trackedEntityType: "WbDGDKGBjKh",
                    orgUnit: orgUnit.id,
                    createdAt: format(new Date(),'yyyy-MM-dd'),
                    enrollments:[
                        {
                            occurredAt: format(get(d,"gc5xwL8Iov7"),'yyyy-MM-dd'),
                            orgUnit: orgUnit.id,
                            program: "jxMMKP58LC4",
                            status: "ACTIVE",
                            trackedEntityType: "WbDGDKGBjKh",
                            enrolledAt: format(new Date(),'yyyy-MM-dd'),
                            attributes:[
                                {attribute:"zpbuh92IZv5",value: get(d,"zpbuh92IZv5")},
                                {attribute:"PnTyfCzi21U",value: get(d,"PnTyfCzi21U")},
                                {attribute:"SQ1xgm6PPJA",value: get(d,"SQ1xgm6PPJA")},
                                {attribute:"liQTjxYq72E",value: get(d,"liQTjxYq72E")},
                                {attribute:"fe1F4nvTxPX",value: get(d,"fe1F4nvTxPX")},
                                {attribute:"jKpfUlsauCD",value: ppOrgUnit?.id },
                                {attribute:"lXstk077AsZ",value: orgUnit?.id},
                                {attribute:"EpxTg68OtYJ",value: get(d,"EpxTg68OtYJ")},
                                {attribute:"TwqvBE6IVxN",value: get(d,"TwqvBE6IVxN")},
                                {attribute:"uE16E2Rnx16",value: get(d,"uE16E2Rnx16")},
                                {attribute:"B4mCRObggzm",value: get(d,"B4mCRObggzm")},
                                {attribute:"JvQcAg9kiUH",value: get(d,"JvQcAg9kiUH")},
                                {attribute:"EIwXld7Sc9o",value: get(d,"EIwXld7Sc9o")},
                                {attribute:"M2mQBNAhYwW",value: get(d,"M2mQBNAhYwW")},
                                {attribute:"pOKzZubB27Y",value: get(d,"pOKzZubB27Y")},
                                {attribute:"InTacvgZhpW",value: get(d,"InTacvgZhpW")}
                            ]?.filter((v)=>v?.value),
                            events:[
                                {
                                    occurredAt: format(get(d,"gc5xwL8Iov7"),'yyyy-MM-dd'),
                                    orgUnit: orgUnit.id,
                                    program: "jxMMKP58LC4",
                                    programStage: "pjs7MjdYttv",
                                    status: "COMPLETED",
                                    trackedEntityType: "WbDGDKGBjKh",
                                    enrolledAt: format(new Date(),'yyyy-MM-dd'),
                                    enrollmentStatus: "ACTIVE",
                                    dataValues:[
                                        {dataElement:"NbY39IsysW8",value: get(d,"NbY39IsysW8")},
                                        {dataElement:"ZbV6b9nyjEA",value: get(d,"ZbV6b9nyjEA")},
                                        {dataElement:"zPurCMBL0Nu",value: get(d,"zPurCMBL0Nu")},
                                        {dataElement:"RhvGRpZugO3",value: get(d,"RhvGRpZugO3")},
                                        {dataElement:"OjJycXuMuZk",value: get(d,"OjJycXuMuZk")},
                                        {dataElement:"GvmIaOBA03d",value: get(d,"GvmIaOBA03d")},
                                        {dataElement:"lUy2eqH1sEJ",value: get(d,"lUy2eqH1sEJ")},
                                        {dataElement:"KzMfUxbeFzD",value: get(d,"KzMfUxbeFzD")},
                                        {dataElement:"Cy318oojbdQ",value: get(d,"Cy318oojbdQ")},
                                        {dataElement:"fcu3uzzjyKs",value: get(d,"fcu3uzzjyKs")},
                                        {dataElement:"PRGOGappybO",value: get(d,"PRGOGappybO")},
                                        {dataElement:"MecFf6Wq7LR",value: epOrgUnit?.id},
                                        {dataElement:"n0ShOa0FxbX",value: edOrgUnit?.id},
                                        {dataElement:"iagm7CqAJJh",value: get(d,"iagm7CqAJJh")},
                                        {dataElement:"rl6qyAcUs38",value: get(d,"rl6qyAcUs38")},
                                        {dataElement:"Vage2qvHXd0",value: get(d,"Vage2qvHXd0")},
                                        {dataElement:"TFC0Rw839uT",value: get(d,"TFC0Rw839uT")},
                                        {dataElement:"vzTfKRtECRq",value: get(d,"vzTfKRtECRq")},
                                        {dataElement:"VEP9Sw6YF8n",value: get(d,"VEP9Sw6YF8n")},
                                        {dataElement:"LQtnBdLYXpt",value: get(d,"LQtnBdLYXpt")},
                                        {dataElement:"c0AabYVBn3m",value: get(d,"c0AabYVBn3m")},
                                        {dataElement:"U5ObMxm5NK8",value: get(d,"U5ObMxm5NK8")},
                                        {dataElement:"UdE4lSfvq3g",value: get(d,"UdE4lSfvq3g")},
                                        {dataElement:"FlgUIrpzdAk",value: get(d,"FlgUIrpzdAk")?.split(",")?.map((t)=>t?.trim())?.join(",")},
                                        {dataElement:"llmn6FOCToG",value: get(d,"llmn6FOCToG")?.split(",")?.map((t)=>t?.trim())?.join(",")},
                                        {dataElement:"gc5xwL8Iov7",value: format(get(d,"gc5xwL8Iov7"),'yyyy-MM-dd')},
                                        {dataElement:"XRg8WWy75xH",value: format(get(d,"XRg8WWy75xH"),'yyyy-MM-dd')},
                                        {dataElement:"ItA7s4eRtgD",value: get(d,"ItA7s4eRtgD")},
                                        {dataElement:"n3E7I8XIsGW",value: get(d,"n3E7I8XIsGW")},
                                        {dataElement:"YOIw7kXDTCB",value: get(d,"YOIw7kXDTCB")},
                                        {dataElement:"Q2XqijFJnIr",value: get(d,"Q2XqijFJnIr")},
                                        {dataElement:"Kfc4bffUKU2",value: get(d,"Kfc4bffUKU2")},
                                        {dataElement:"cwp2WfIfxKj",value: get(d,"cwp2WfIfxKj")},
                                        {dataElement:"xpUsddrA1TP",value: get(d,"xpUsddrA1TP")},
                                        {dataElement:"Ma6dFGkAwoY",value: eHostOrgUnit?.id}

                                    ]?.filter((v)=>v?.value)
                                }
                            ]
    
    
                        }
                    ]
                })
            }
        }
        else{
            return undefined
        }
    }).filter(String).filter(Boolean)
}

/**
 * Get file with uploaded data
 * @param {*} file 
 * @returns 
 */
export const getUploadedDataFile = (file)=>{
    const wb = read(file,{ cellDates: true, dateNF: 'yyyy-mm-dd' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const dataWs = getMergeValue(ws);
    const data = utils.sheet_to_json(dataWs);
    return data;
}
/**
 * Get upload formatted Payload
 * @param {*} data 
 * @param {*} type 
 * @param {*} attribute 
 * @returns 
 */
export const getUploadedData = (data,type,attribute)=>{
    if(type ==='TRACKER_DATA'){
        return data;
    }
    else{
        const dropData = nativeDropLabels(data,['Numerator', 'Denominator', 'Divisor', 'Multiplier','Factor']);
        const renamedData = nativeRenameLabels(dropData,[
            { old: 'Data',new:'dataElement'},
            { old: 'Period',new:'period'},
            { old: 'Organisation unit',new:'orgUnit'},
            { old: 'Category option combo',new:'categoryOptionCombo'},
            { old: 'Value',new:'value'},
        ]);
        const stringifiedData = renamedData?.map((v)=>{
            if(Object.hasOwn(v,'period')){
                v.period = v?.period.toString();
            }
            if(type === 'INDICATOR_DATA' && Object.hasOwn(v,'categoryOptionCombo') && v.categoryOptionCombo ==='lmbxvugTvKr'){
                v.categoryOptionCombo = 'HllvX50cXC0';
            }
            if(type === 'REPORTING_RATE'){
                if(v.dataElement?.includes('.ACTUAL_REPORTS') && !v.dataElement?.includes('.ACTUAL_REPORTS_ON_TIME')){
                    v.dataElement = 'BAIG9bSqLic';
                    v.categoryOptionCombo = 'tzlJJCzGgV0';
                }
                if(v.dataElement?.includes('.ACTUAL_REPORTS_ON_TIME')){
                    v.dataElement = 'BAIG9bSqLic';
                    v.categoryOptionCombo = 'c6ujrqLHkXx';
                }
                if(v.dataElement?.includes('.EXPECTED_REPORTS')){
                    v.dataElement = 'BAIG9bSqLic';
                    v.categoryOptionCombo = 'lhHpOfGGIVX';
                }
                if(v.dataElement?.includes('.REPORTING_RATE_ON_TIME')){
                    v.dataElement = 'BAIG9bSqLic';
                    v.categoryOptionCombo = 'n3BZzH0LlDI';
                }
                if(v.dataElement?.includes('.REPORTING_RATE') && !v.dataElement?.includes('.REPORTING_RATE_ON_TIME')){
                    v.dataElement = 'BAIG9bSqLic';
                    v.categoryOptionCombo = 'vv50rsF0BLM';
                }
            }
            return v;
        });
        let attributedData = stringifiedData;
        if(attribute){
            attributedData = nativeAddLabels(stringifiedData,'attributeOptionCombo',attribute);
        }
        return attributedData;
    }
}
/**
 * Review data
 * @param {*} data 
 * @returns 
 */
export const reviewDhis2Import =(data)=>{   
    /* create workbook and display HTML */
    const wb = utils.book_new();
    const ws = utils.json_to_sheet(data);
    utils.book_append_sheet(wb, ws, "HMIS Data"); 
    const worksheet = wb.Sheets[wb.SheetNames[0]];   
    const tblData = utils.sheet_to_html(worksheet);
    return tblData;
}