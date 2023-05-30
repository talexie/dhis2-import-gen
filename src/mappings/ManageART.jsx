import * as React from 'react';
import { css } from '@emotion/react';
import { FileInputField, Button, Divider, NoticeBox, FileListItem, CircularLoader } from '@dhis2/ui';
import { Container, Stack } from '@mui/material';
import { useState } from 'react';
import {  ImportFeedBack, OrgUnitControl, PeriodField, useOrgUnit } from '../ui';
import {createWorkerFactory, useWorker} from '@shopify/react-web-worker';
import 'react-data-grid/lib/styles.css';
import { useQueryClient, useMutation } from 'react-query';
import { generatePeriods, getPeriodTypes, useUser } from '../utils';
import { sortBy } from 'lodash';
import { format } from 'date-fns';

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

export const postData = async({body})=>{
    const fetchBody = JSON.stringify(body);
    const url = `../../tracker?async=false`;
    const response = await fetch(url, {
      method: "POST",
      body: fetchBody,
      headers: {
        "Content-type": "application/json"
      }
    });
    let res = await response.json();
    return res;
}
export const postFile = async({ file, fileName, selected } )=>{
    const url = `../../fileResources`;
    const blob = new Blob([new Uint8Array(file)], {type:"application/octet-stream"});
    const formData = new FormData();
    formData.append('file',blob,fileName??`ART Register_${selected?.parent?.name??''}_${selected?.displayName??""}_${format(new Date(),'yyyy-MM-dd')}.xlsx`);
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        "accept": "application/json"
      }
    });
    let res = await response.json();
    return res;
}
export const deleteFile = async(file)=>{
    const url = `../../fileResources/${file}`;
    const response = await fetch(url, {
      method: "POST",
      body: new FormData(),
      headers: {
        "accept": "application/json"
      }
    });
    let res = await response.json();
    return res;
}

  
export const ManageART = () => {   
    const workerFile = useWorker(createWorker);
    const queryClient = useQueryClient();
    const [open, setOpen ] = useState(false); 
    const [file, setFile ] = useState(undefined);
    const [type, setType ] = useState(undefined);
    const [uploaded,setUploaded] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [fileName, setFileName ] = useState(undefined);
    const [fileId, setFileId ] = useState(undefined);
    const [message,setMessage] = useState("");
    const [selected, setSelected ] = React.useState([]);
    const { organisationUnitId, handleOrganisationUnitChange} = useOrgUnit();
    const { mutate, isLoading:posting } = useMutation(postData, {
        onSuccess: data => {
            setType("TRACKER");
            setMessage(data?.stats);
            if(data?.status ==="OK"){
                setSubmitted(false);
            }
            else{
                setSubmitted(false);
            }       
        },
        onError: (error) => {
          alert("There was an error");
          setSubmitted(false);
        },
        onSettled: () => {
          queryClient.invalidateQueries('create');
        }
      });
      const { mutate:mutateFile, isLoading:postingFile } = useMutation(postFile, {
        onSuccess: data => {
            setType("FILE");
            setUploaded(true);
            if(data?.status ==="OK"){
                setMessage("File has been uploaded successfully.");
                setFileId(data?.response?.fileResource);
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
      const { mutate:mutateRemoveFile } = useMutation(deleteFile, {
        onSuccess: data => {
            setType("FILE");
            if(data?.status ==="OK"){
                setMessage("File has been removed successfully.");
                setSubmitted(false);
                setUploaded(false);
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
    const submitData = async ()=>{
        setSubmitted(true);
        if(fileId?.id){
            const dataValues = await workerFile.uploadART(selected,fileId);
            mutate({body: dataValues});
        }
        else{
            setType("FILE");
            setMessage("Saving the file has failed.");
            setUploaded(false);  
        }     
    }
    const onChange = (fileObject,_e)=>{
        _e.preventDefault(); 
        setSubmitted(true);
        const {  files } = fileObject;      
        setFileName(files[0]?.name);
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(files[0]);
        fileReader.onload = async(e) => {
            setSubmitted(true);
            setFile(e?.target?.result);
            mutateFile( {file: await workerFile.getUploadFile(e?.target?.result),fileName:fileName, selected: selected});
        };
    }
    const onRemove =()=>{ 
        if(fileId?.id){
            mutateRemoveFile(fileId?.id);
            setUploaded(false);  
        }       
        setFile(undefined);
        setFileName(undefined);
    }
    const handleOpen =(_e)=>{
        setOpen(true);
    }
    const handleClose =(_e)=>{
        setOpen(false);
    }

    const getOrgUnit =(value)=>{
        setSelected(value);
    }
    return (
        <Container css={ classes.root }>
            <Stack spacing= {2} alignItems={ 'flex-start'}>
                <h3>Upload ART Register</h3>
                <Divider/>  
                <NoticeBox title={"How to submit ART Register"}>
                    Upload the ART Register file to save. Upon upload, the "First Name" column will be automatically removed so that no patient identifiable data is imported into the system.
                </NoticeBox>
                
                {
                    !(posting || postingFile)?(
                        <ImportFeedBack 
                            type={ type }
                            message = { message }
                        />
                    ):(
                        submitted?(<CircularLoader />):null
                    )
                }   
                <Divider/> 
                <div>
                    <Button css = { classes.label } onClick={ handleOpen }>
                        <span>Select Organisation Unit</span>
                    </Button>
                    <span css={classes.selected}> { selected?.label || selected?.displayName }</span>
                    {
                        open?(
                            <div>                                                    
                                <OrgUnitControl                      
                                    getSelected = { getOrgUnit }
                                    multiSelect = { false }
                                    onChange={handleOrganisationUnitChange}
                                    open = { open }
                                    handleClose = { handleClose }
                                    selectionLevel = { [6] }
                                    enableSelectionLevel ={ true }
                                />
                            </div>
                                    
                        ): null
                    }
                </div>              
                <Divider/>         
                <FileInputField
                    helpText="Please upload the file used for mapping (only csv or Excel)"
                    label="Upload ART Register"
                    name="uploadName"
                    required= { true }
                    multiple = { false }
                    accept = { `.xlsx,.xlsb,.xlsm,.xls,.csv,.xltx,.xltm`}
                    onChange={onChange}
                    validationText = { uploaded?"File has been saved.": "File not yet uploaded." }
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

export default ManageART;
