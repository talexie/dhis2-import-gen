import * as React from 'react';
import { css } from '@emotion/react';
import { FileInputField, Divider, Button, NoticeBox, FileListItem, CircularLoader, FieldGroup, Radio } from '@dhis2/ui';
import { Container, Stack  } from '@mui/material';
import { useState, useEffect } from 'react';
import { ImportFeedBack } from '../ui';
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker';
import 'react-data-grid/lib/styles.css';
import DataGrid from 'react-data-grid';
import { useQueryClient, useMutation, QueryObserver, useQuery } from 'react-query';
import isEmpty from 'lodash/isEmpty';

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
  
export const ImportAggregateData = () => {   
     /* the component state is an HTML string */
    const [__html, setHtml] = useState("");
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
    const [crossChecked, setCrossChecked] = useState(false);
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
        queryKey: [`system/taskSummaries/${message?.jobType}/${taskId}`],
        enabled: !!taskId && !!message?.jobType && taskCompleted
    });
    const { data:fetchOrgUnits, isLoading: fetchOrgUnitsLoading } = useQuery({ 
        queryKey: [`organisationUnits?filter=shortName:in:[${ orgUnits?.join(',')}]`],
        enabled: !isEmpty(orgUnits) && validated
    });
    const { data:fetchEvents, isLoading: fetchEventsLoading } = useQuery({ 
        queryKey: [`tracker/trackedEntities.json?program=s8WUHekh0aU&ouMode=ACCESSIBLE&filter=PnTyfCzi21U:in:${ events?.join(';')}&fields=*,!relationships,!programOwners,!createdBy,!updatedBy`],
        enabled: !isEmpty(events) && validated
    });

    
    const reviewData=async()=>{
        // Process data
        const fileResult = await workerFile.reviewDhis2Import(rows);
        setHtml(fileResult); // update state
        setReviewed(true);
    }
    const confirmData =(e)=>{
        setValidated(true);
    }
    const submitData = async ()=>{
        if(validated && crossChecked){
            const dataValues = {
                type: type,
                data:{
                    dataValues: rows
                }
            };
            mutate(dataValues); 
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
            const validateOrgUnits = await workerFile.getElementByProperty(fileData,'Event_District');
            const validateParticipants = await workerFile.getElementByProperty(fileData,'Participant_ID');
            console.log("Participants:",validateParticipants);
            setOrgUnits(validateOrgUnits);
            setEvents(validateParticipants);
            const sData = await workerFile.getUploadedDataFile(fileData,type,'bdV6upF84Hd');
            setRows(sData);
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
            queryKey: [`system/tasks/${message?.jobType}/${taskId}`],
            enabled: !!taskId && !!message?.jobType && !taskCompleted,
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
            setTasks(result?.data?.reverse()??[]);
            //unsubscribe()
        })
        return ()=>{
            unsubscribe();
        }
    },[taskId,message?.jobType,queryClient,taskCompleted]);

    useEffect(()=>{
        if(hasTaskCompleted(tasks) && !summaryCompleted){
            setTaskCompleted(true);
        }
        else{
            setTaskCompleted(false);
        }
    },[summaryCompleted,tasks]);
    useEffect(()=>{
        if(!fetchEventsLoading && !fetchOrgUnitsLoading){
            setCrossChecked(true);
        }
        else{
            setCrossChecked(false);  
        }
    },[fetchEventsLoading, fetchOrgUnitsLoading]);
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
                                    {
                                        tasks?.map((t,i)=>(
                                        <>
                                            <Divider/>
                                            <Stack spacing={1} direction='row'>
                                                <div key={`task-${i}-${t.id}-id`}>{t?.id}</div>
                                                <div key={`task-${i}-${t.id}-category`}>{t?.category}</div>
                                                <div key={`task-${i}-${t.id}-level`}>{t?.level}</div>
                                                <div key={`task-${i}-${t.id}-message`}>{t?.message}</div>
                                            </Stack>
                                        </>
                                        ))
                                    }
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
                                    disabled ={ completed || taskCompleted }
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
                            columns={columns} 
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
