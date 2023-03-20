import * as React from 'react';
import { css } from '@emotion/react';
import { Radio,FileInputField, Button, Divider, NoticeBox, FileListItem, CircularLoader, FieldGroup } from '@dhis2/ui';
import { Container, Stack } from '@mui/material';
import { useState } from 'react';
import {  ImportFeedBack } from '../ui';
import {createWorkerFactory, useWorker} from '@shopify/react-web-worker';
import 'react-data-grid/lib/styles.css';
import { useQueryClient, useMutation } from 'react-query';

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
    })
};
export const mappingTypes = [
    {
        name: "Organisation Unit",
        label: "Organisation Unit",
        value: "LOCATION"
    },
    {
        name: "Indicator",
        label: "Indicator",
        value: "INDICATOR"
    },
    {
        name: "SMARTCare",
        label: "SMARTCare",
        value: "SMARTCARE"
    }
]
export const postData = async({body,type})=>{
    const fetchBody = JSON.stringify(body);
    let url = null;
    if(type === "LOCATION"){
        url = `../../dataStore/frs/zm`;
    }
    else if(type === "INDICATOR"){
        url = `../../dataStore/terminology/mappings`;
    }
    else if(type === "SMARTCARE"){
        url = `../../dataStore/terminology/smartcare`;
    }
    else{
        //Do nothing
    }
    const response = await fetch(url, {
      method: "PUT",
      body: fetchBody,
      headers: {
        "Content-type": "application/json"
      }
    });
    let res = await response.json();
    return res;
  }

  
export const ManageMappings = () => {   
    const workerFile = useWorker(createWorker);
    const queryClient = useQueryClient();
    const [type, setType ] = React.useState(undefined);
    const [file, setFile ] = React.useState(undefined);
    const [submitted, setSubmitted] = useState(false);
    const [fileName, setFileName ] = React.useState(undefined);
    const [message,setMessage] = useState("");
    const { mutate, isLoading:posting } = useMutation(postData, {
        onSuccess: data => {
            setMessage(data);
            if(data?.status ==="OK"){
                alert(data?.message);
                setSubmitted(false);
            }
            else{
                setSubmitted(false);
            }       
        },
        onError: () => {
          alert("There was an error");
          setSubmitted(false);
        },
        onSettled: () => {
          queryClient.invalidateQueries('create');
        }
      });
    const onSelectMapping=(selected,_event)=>{
        setType(selected?.value);  
    }
    const submitData = async ()=>{
        setSubmitted(true);
        const dataValues = await workerFile.uploadMapping(file,type);
        mutate({body: dataValues, type: type});     
    }
    const onChange =(fileObject,_e)=>{ 
        const {  files } = fileObject;        
        setFileName(files[0]?.name);
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(files[0]);
        fileReader.onload = e => {
            setFile(e?.target?.result);
        };
    }
    const onRemove =()=>{   
        setFile(undefined);
        setFileName(undefined);
    }
    return (
        <Container css={ classes.root }>
            <Stack spacing= {2} alignItems={ 'flex-start'}>
                <h3>Upload Mappings</h3>
                <Divider/>  
                <NoticeBox title={"How to submit mappings"}>
                    Upload the mapping file to save.
                </NoticeBox>
                
                {
                    !posting?(
                        <ImportFeedBack 
                            type={ message?.status }
                            message = { message }
                        />
                    ):(
                        submitted?(<CircularLoader />):null
                    )
                }   
                <Divider/>
                <FieldGroup>
                    {
                        mappingTypes?.map((m)=>
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
                    helpText="Please upload the file used for mapping (only csv or Excel)"
                    label="Upload Mapping File"
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
                <Button
                    name="Button"
                    onClick={ submitData }
                    type="button"
                    value="default"
                >
                    Save
                </Button>
            </Stack>
        </Container>
    )
}

export default ManageMappings;
