import * as React from 'react';
import { css } from '@emotion/react';
import { FileInputField, Divider, Button, NoticeBox, FileListItem, CircularLoader, FieldGroup, Radio } from '@dhis2/ui';
import { Container, Stack  } from '@mui/material';
import { useState, useEffect } from 'react';
import { ImportFeedBack } from '../ui';
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker';
import 'react-data-grid/lib/styles.css';
import DataGrid from 'react-data-grid';
import { useQueryClient, useMutation, QueryObserver, useQuery, useQueries } from 'react-query';
import isEmpty from 'lodash/isEmpty';
import chunk from 'lodash/chunk';
import uniq from 'lodash/uniq';
import get from 'lodash/get';
import flatten from 'lodash/flatten';
import { trainingMap } from '../ExcelConverterWorker';
import { DataTable,TableHead,DataTableRow,DataTableCell, DataTableColumnHeader, TableBody } from '@dhis2/ui';
import { defaultQueryFn } from '../App2';
import { isDate, isValid, format } from 'date-fns';


const columns = [
  { key: 'dataElement', name: 'Data Element', resizable: true, sortable: true},
  { key: 'categoryOptionCombo', name: 'Disaggregation', resizable: true, sortable: true},
  { key: 'period', name: 'Period', resizable: true, sortable: true},
  { key: 'orgUnit', name: 'Organisation Unit', resizable: true, sortable: true },
  { key: 'value', name: 'Value', resizable: true, sortable: true },
  { key: 'attributeOptionCombo', name: 'Project', resizable: true, sortable: true }
];
const createWorker = createWorkerFactory(() => import('../ExcelConverterWorker'));

const classes={
    root: css({
        marginLeft: 20
    }),
    orgUnit: css({      
        position: 'relative',
        width: '300px'
    }),
    label: css({
        textAlign:'left',
        marginBottom: '4px'
    }),
    validateCss: css({
        marginBottom: '16px',
        marginTop: '16px'
    }),
    notice: css({
        color: 'red',
        padding:  '16px'
    }),
    success: css({
        color: 'green',
        padding:  '16px'
    }),
    yesb: css({
        color: '#ffffff',
        backgroundColor:  'green'
    })
};
export const reportTypes = [
    {
        name: "Reporting Rates",
        label: "Reporting Rates",
        value: "REPORTING_RATE"
    },
    {
        name: "HMIS Indicator Data",
        label: "HMIS Indicator Data",
        value: "INDICATOR_DATA"
    },
    {
        name: "Training",
        label: "Training",
        value: "TRACKER_DATA"
    }
]
export const postAggregateData = async(bodyData)=>{
    const apiPayload = bodyData?.data;
    const dataType = bodyData?.type;
    const apiEndpoint = (dataType ==='TRACKER_DATA')?'tracker':'dataValueSets';
    const fetchBody = JSON.stringify(apiPayload);
    const response = await fetch(`../../${apiEndpoint}?preheatCache=true&importStrategy=CREATE_AND_UPDATE&async=true`, {
      method: "POST",
      body: fetchBody,
      headers: {
        "Content-type": "application/json"
      }
    });
    let res = await response.json();
    return res;
}

export const hasTaskCompleted = (task) => {
    return task?.some((t)=>t?.completed);
}

export const getGridColumns = (data=[],type)=>{
    if(type === 'TRACKER_DATA'){
        return data?.map((m)=>({ 
            key: m?.old, 
            name: m?.old, 
            resizable: true, 
            sortable: true,
            renderCell: (props)=>{
                const { column, row } = props;
                const value = get(row,column.key);
                if(isValid(value) && isDate(value)){
                    return( 
                        <div>
                            { format(value,'yyyy-MM-dd') }
                        </div>
                    )
                }
                else if(typeof value === 'boolean' || value instanceof Boolean){
                    return( 
                        <div>
                            { value?.toString() }
                        </div>
                    )
                }
                else{
                    return( 
                        <div>
                            { value }
                        </div>
                    )
                }
            }
        })
        )
    }
    return columns;

}
export const isReqsLoaded =(data,key='trackedEntities')=>{
    const copyData = [...data];
    return copyData?.every((d)=>(!d?.isLoading && Object.hasOwn(d?.data || {},key)));
}
export const consolidateQueryData =(data)=>{
    return flatten(data?.map((q)=>{
        return q?.data?.trackedEntities;
    }));
}
export const getTaskApi =(type,messageJobType,taskId)=>{
    if(type === 'TRACKER_DATA'){
        return `tracker/jobs/${taskId}`;
    }
    else{
        return `system/tasks/${messageJobType}/${taskId}`;
    }

}

export const isTaskDone =(type,messageJobType,taskId)=>{
    if(type === 'TRACKER_DATA'){
        return !!taskId;
    }
    else{
        return !!taskId && !!messageJobType;
    }

}
export const ImportAggregateData = () => {   
    const [gridColumns, setGridColumns] = useState(columns);
    const workerFile = useWorker(createWorker);
    const queryClient = useQueryClient();
    const [rows, setRows] = useState([]);
    const [validated, setValidated]= useState(false);
    const [completed, setCompleted] = useState(false);
    const [reviewed, setReviewed] = useState(false);
    const [taskCompleted, setTaskCompleted] = useState(false);
    const [fileName, setFileName ] = useState(undefined);
    const [message,setMessage] = useState("");
    const [tasks,setTasks] = useState([]);
    const [taskId,setTaskId] = useState(undefined);
    const [type, setType ] = useState(undefined);
    const [orgUnits,setOrgUnits] = useState([]);
    const [events,setEvents] = useState([]);
    const [dsOrgUnits,setDsOrgUnits] = useState([]);
    const [dsEvents,setDsEvents] = useState([]);
    const [ouChecked, setOuChecked] = useState(false);
    const [evChecked, setEvChecked] = useState(false);
    const { mutate, isLoading:posting } = useMutation(postAggregateData, {
        onSuccess: data => {
            setMessage(data?.response);
            setTaskId(data?.response?.id);
            setCompleted(true);    
        },
        onError: () => {
          alert("There was an error");
          setCompleted(false);
        }
    });
    const { data:summaries, isLoading: summaryCompleted } = useQuery({ 
        queryKey: [getTaskApi(type,message?.jobType,taskId)],
        queryFn: defaultQueryFn,
        enabled: isTaskDone(type,message?.jobType,taskId) && taskCompleted
    });
    const { data:fetchOrgUnits, isLoading: fetchOrgUnitsLoading } = useQuery({ 
        queryKey: [`organisationUnits?fields=id,name,code,shortName,level&filter=shortName:in:[${ orgUnits?.join(',')}]`],
        queryFn: defaultQueryFn,
        enabled: !isEmpty(orgUnits) && validated && !ouChecked
    });
    const trackData = useQueries(events?.map((event)=>({ 
            queryKey: [`tracker/trackedEntities.json?paging=false&program=jxMMKP58LC4&ouMode=ACCESSIBLE&filter=PnTyfCzi21U:in:${ event?.join(';')}&fields=trackedEntity,orgUnit,trackedEntityType,attributes[attribute,value],enrollments[enrollment,occuredAt,enrolledAt,program,events[dataValues[event,dataElement,value]]],!relationships,!programOwners,!createdBy,!updatedBy`],
            queryFn: defaultQueryFn,
            enabled: !isEmpty(event) && validated && !evChecked
        }))
    );
    /*const { data:fetchEvents, isLoading: fetchEventsLoading } = useQuery({ 
        queryKey: [`tracker/trackedEntities.json?paging=false&program=jxMMKP58LC4&ouMode=ACCESSIBLE&filter=PnTyfCzi21U:in:${ events?.join(';')}&fields=trackedEntity,orgUnit,trackedEntityType,attributes[attribute,value],enrollments[enrollment,occuredAt,enrolledAt,program,events[dataValues[event,dataElement,value]]],!relationships,!programOwners,!createdBy,!updatedBy`],
        queryFn: defaultQueryFn,
        enabled: !isEmpty(events) && validated && !evChecked
    });*/
    
    
    const reviewData=async()=>{
        setReviewed(true);
    }
    const confirmData =(e)=>{
        setValidated(true);
    }
    const submitData = async ()=>{
        if(validated && evChecked && ouChecked){
            if(type === 'TRACKER_DATA'){
                const records = await workerFile.createTrackerPayload(rows,dsEvents,dsOrgUnits);
                const mergedRecords = await workerFile.mergeRecords(records);
                mutate({
                    type: type,
                    data: {
                        trackedEntities: mergedRecords
                    }
                });  
            }
            else{
                mutate({
                    type: type,
                    data:{
                        dataValues: rows
                    }
                }); 
            }
        } 
        else{
            setCompleted(false);
        }   
    }
    const onChange = (fileObject,_e)=>{ 
        const {  files } = fileObject;        
        setFileName(files[0]?.name);
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(files[0]);
        fileReader.onload = async(e) => {
            const fileData = await workerFile.getUploadedDataFile(e?.target?.result);
            const pdOrgUnits = await workerFile.getElementByProperty(fileData,'Participant_District_ECHO');
            const epOrgUnits = await workerFile.getElementByProperty(fileData,'Event_Province_ECHO');
            const edOrgUnits = await workerFile.getElementByProperty(fileData,'Event_District_ECHO');
            const ppOrgUnits = await workerFile.getElementByProperty(fileData,'Participant_Province_ECHO');
            const validateParticipants = await workerFile.getElementByProperty(fileData,'Participant_ID');
            const validateOrgUnits = uniq([...pdOrgUnits,...epOrgUnits,...edOrgUnits,...ppOrgUnits]);
            setOrgUnits(validateOrgUnits);
            setEvents(chunk(uniq(validateParticipants),70));
            //setEvents(uniq(validateParticipants));
            const sData = await workerFile.getUploadedData(fileData,type,'bdV6upF84Hd');
            setRows(sData);
            setGridColumns(getGridColumns(trainingMap,type));
        }; 
    }
    const onRemove =()=>{       
        setFileName(undefined);
    }
    const onSelectMapping=(selected,_event)=>{
        setType(selected?.value);  
    }

    useEffect(()=>{
        const observer = new QueryObserver(queryClient, { 
            queryKey: [getTaskApi(type,message?.jobType,taskId)],
            queryFn: defaultQueryFn,
            enabled: isTaskDone(type,message?.jobType,taskId) && !taskCompleted,
            refetchInterval: ()=>{
                if(taskCompleted) {
                    return false;
                }
                else{
                    return 10000;
                }
            }
        })
    
        const unsubscribe = observer.subscribe(result => {
            if(type){
                setTasks(result?.data??[]);
            }
            else{
                setTasks(result?.data?.reverse()??[]);
            }
        })
        return ()=>{
            unsubscribe();
        }
    },[taskId,message?.jobType,queryClient,taskCompleted, type]);

    useEffect(()=>{
        if(hasTaskCompleted(tasks) && !summaryCompleted){
            setTaskCompleted(true);
        }
        else{
            setTaskCompleted(false);
        }
    },[summaryCompleted,tasks]);

    useEffect(()=>{
        if(!fetchOrgUnitsLoading && validated){
            setDsOrgUnits(fetchOrgUnits?.organisationUnits);
            setOuChecked(true);
        }
    },[fetchOrgUnitsLoading,validated,fetchOrgUnits?.organisationUnits]);

    /*useEffect(()=>{
        if(!fetchEventsLoading && validated){
            console.log("1:",fetchEvents)
            setDsEvents(fetchEvents?.trackedEntities);
            setEvChecked(true);
        }
    },[fetchEventsLoading, validated,fetchEvents?.trackedEntities]);
    */
    useEffect(()=>{
        if(validated && isReqsLoaded(trackData)){
            const fetchedData = [...consolidateQueryData(trackData)];
            setDsEvents(()=>fetchedData);
            setEvChecked(true);
        }
    },[validated,trackData]);
    return (
        <Container css={ classes.root }>
            {
                !reviewed || validated?
                (
                    <Stack spacing= {2} alignItems={ 'flex-start'}>
                        <h3>HMIS to ECHO Data Import</h3>
                        <Divider/>  
                        <NoticeBox title={"How to import data from HMIS Report"}>
                            Download HMIS report and upload.
                        </NoticeBox>
                        
                        {
                            !posting && taskCompleted?(
                                <ImportFeedBack 
                                    type={ summaries?.status }
                                    message = { summaries}
                                />
                            ):(
                                (completed && validated)?(
                                    
                                        <CircularLoader />
                                        
                                ):null
                            )
                        }
                        {
                            
                            !isEmpty(tasks) && (
                                <Stack spacing= {2} alignItems={ 'flex-start'}>
                                    <DataTable>
                                        <TableHead>
                                            <DataTableRow>
                                                <DataTableColumnHeader>ID</DataTableColumnHeader>
                                                <DataTableColumnHeader>Task</DataTableColumnHeader>
                                                <DataTableColumnHeader>Level</DataTableColumnHeader>
                                                <DataTableColumnHeader>Message</DataTableColumnHeader>
                                            </DataTableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                tasks?.map((t,i)=>(
                                                    <DataTableRow key={`task-${i}-${t.id}-id`}>
                                                        <DataTableCell>{t?.id}</DataTableCell>
                                                        <DataTableCell>{t?.category}</DataTableCell>
                                                        <DataTableCell>{t?.level}</DataTableCell>
                                                        <DataTableCell>{t?.message}</DataTableCell>
                                                    </DataTableRow>
                                                ))
                                            }
                                        </TableBody>
                                    </DataTable>
                                </Stack>
                            )
                        }                                 
                               
                        <Divider/>  
                        <FieldGroup>
                            {
                                reportTypes?.map((m)=>
                                    (
                                        <Radio     
                                            name ={ 'type'}
                                            label = { m?.label }
                                            value = { m?.value }
                                            checked = { m?.value === type }
                                            onChange = { onSelectMapping }
                                        />
                                    )
                                )
                            }
                            
                        </FieldGroup>
                        <Divider/>       
                        <FileInputField
                            helpText="Please submit EXCEL/CSV report file from HMIS"
                            label="Upload HMIS Report"
                            name="uploadName"
                            required= { true}
                            onChange={onChange}
                        >
                            {
                                fileName?(
                                    <FileListItem
                                        label={ fileName??'' }
                                        onRemove={onRemove}
                                        removeText="Remove"
                                    />
                                ):null
                            }
                        </FileInputField>         
                        <Divider/>
                        {
                            validated?(
                                <Button
                                    name="Button"
                                    type="button"
                                    value="default"
                                    onClick={ submitData }
                                    disabled ={ completed || taskCompleted || (type ==='TRACKER_DATA' && (!ouChecked || !evChecked)) }
                                >
                                   { completed || taskCompleted?"Submitted" : "Submit" }
                                </Button>
                            ):(
                                <Button
                                    name="Button"
                                    onClick={ reviewData }
                                    type="button"
                                    value="default"
                                    disabled ={ reviewed }
                                >
                                    Review
                                </Button>
                            )
                        }
                    </Stack>
                ):(
                    <>
                        <DataGrid 
                            columns={gridColumns} 
                            rows={rows} 
                            css={ classes.validateCss} 
                        />
                        <Button
                            name="Button"
                            onClick={ confirmData }
                            type="button"
                            value="default"
                        >
                            Confirm
                        </Button>

                    </>
                )
            }
        </Container>
    )
}

export default ImportAggregateData;
