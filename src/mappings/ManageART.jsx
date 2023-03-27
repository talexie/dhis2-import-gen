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
export const postFile = async(file)=>{
    const url = `../../fileResources`;
    const formData = new FormData();
    formData.append('file',file);
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

  
export const ManageART = () => {   
    const workerFile = useWorker(createWorker);
    const queryClient = useQueryClient();
    const [open, setOpen ] = useState(false); 
    const [file, setFile ] = useState(undefined);
    const [submitted, setSubmitted] = useState(false);
    const [fileName, setFileName ] = useState(undefined);
    const [fileId, setFileId ] = useState(undefined);
    const [message,setMessage] = useState("");
    const [selected, setSelected ] = React.useState([]);
    const { organisationUnitId, handleOrganisationUnitChange} = useOrgUnit();
    const { mutate, isLoading:posting } = useMutation(postData, {
        onSuccess: data => {
            setMessage(data);
            if(data?.status ==="OK"){
                //setFileId(data?.message);
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
      const { mutate:mutateFile, isLoading:postingFile } = useMutation(postFile, {
        onSuccess: data => {
            setMessage(data);
            if(data?.status ==="OK"){
                setFileId(data?.response?.fileResource);
            }       
        },
        onError: () => {
          alert("There was an error");
        },
        onSettled: () => {
          queryClient.invalidateQueries('create');
        }
      });
    const submitData = async ()=>{
        setSubmitted(true);
        const dataValues = await workerFile.uploadART(selected,fileId);
        mutate({body: dataValues});     
    }
    const onChange =(fileObject,_e)=>{ 
        const {  files } = fileObject; 
        mutateFile(files[0]);      
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
                            type={ message?.status }
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

export default ManageART;
