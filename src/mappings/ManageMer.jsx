import * as React from 'react';
import { css } from '@emotion/react';
import { FileInputField, Divider,Button, NoticeBox, FileListItem, Modal, ModalContent,ModalTitle, ButtonStrip, ModalActions, CircularLoader } from '@dhis2/ui';
import { Container, Stack  } from '@mui/material';
import { useState, useRef } from 'react';
import { useOrgUnit,PeriodField, OrgUnitControl, ImportFeedBack } from '../ui';
import sortBy from 'lodash/sortBy';
import { generatePeriods, getPeriodTypes, useUser } from '../utils';
import {createWorkerFactory, useWorker} from '@shopify/react-web-worker';
import 'react-data-grid/lib/styles.css';
import DataGrid from 'react-data-grid';
import { useQuery, useQueryClient, useMutation } from 'react-query';

const columns = [
  { key: 'A', name: 'A', resizable: true, sortable: true, frozen: true },
  { key: 'B', name: 'B', resizable: true, sortable: true, frozen: true },
  { key: 'C', name: 'C', resizable: true, sortable: true, frozen: true},
  { key: 'D', name: 'D', resizable: true, sortable: true },
  { key: 'E', name: 'E', resizable: true, sortable: true },
  { key: 'F', name: 'F', resizable: true, sortable: true },
  { key: 'G', name: 'G', resizable: true, sortable: true },
  { key: 'H', name: 'H', resizable: true, sortable: true },
  { key: 'I', name: 'I', resizable: true, sortable: true }
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
const periodTypes = getPeriodTypes(['Monthly']);

export const postData = async(bodyData)=>{
    const fetchBody = JSON.stringify(bodyData);
    const response = await fetch('../../dataValueSets', {
      method: "POST",
      body: fetchBody,
      headers: {
        "Content-type": "application/json"
      }
    });
    let res = await response.json();
    console.log(res);
    return res;
  }

  
export const ManageMer = () => {   
    const [open, setOpen ] = useState(false); 
     /* the component state is an HTML string */
    const [__html, setHtml] = useState("");
    /* the ref is used in export */
    const tbl = useRef(null);
    const workerFile = useWorker(createWorker);
    const queryClient = useQueryClient();
    const [periodType, setPeriodType ] = React.useState(undefined);
    const [period, setPeriod ] = React.useState(undefined);
    const [periods, setPeriods ] = React.useState([]);
    const [file, setFile ] = React.useState(undefined);
    const [rows, setRows] = useState([]);
    const [isValidating, setIsValidating]= useState(false);
    const [revalidate, setRevalidated]= useState(false);
    const [isCompleted, setIsCompleted]= useState(false);
    const [isLegacy, setIsLegacy]= useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [fileName, setFileName ] = React.useState(undefined);
    const [selected, setSelected ] = React.useState([]);
    const [mapping, setMapping ] = React.useState([]);
    const [message,setMessage] = useState("");
    const { canResubmit } = useUser();
    const [selectedPeriod,setSelectedPeriod] = useState("");
    const { organisationUnitId, handleOrganisationUnitChange} = useOrgUnit();
    const { data: smartcare, isLoading } = useQuery({
        queryKey: ['dataStore/terminology/smartcare']
    });
    const { data: legacyGroup, isLoading:isLegacyGroupLoading } = useQuery({
        queryKey: [`organisationUnits/${selected}&fields:organisationUnitGroups[id,name,code]`],
        enabled: !selected
    });
    const { mutate, isLoading:posting } = useMutation(postData, {
        onSuccess: data => {
            setMessage(data?.response);
            if(data?.status ==="OK" && data.response.status ==="SUCCESS"){
                setIsCompleted(true);
                setSubmitted(false);
            }
            else{
                setIsCompleted(false);
                setSubmitted(false);
            }       
        },
        onError: () => {
          alert("There was an error");
          setIsCompleted(false);
          setSubmitted(false);
        },
        onSettled: () => {
          queryClient.invalidateQueries('create');
        }
      });
    const onChangePeriodType=({selected})=>{
        setPeriod(undefined);
        setPeriodType(selected);        
        const generatedPeriods = generatePeriods(selected,!canResubmit);
        setPeriods(generatedPeriods);
    }
    const onChangePeriod=({ selected })=>{
        setPeriod(selected);  
    }
    const getOrgUnit =(value)=>{
        setSelected(value);
    }
    const validateData=async()=>{
        // Process data
        return workerFile.createDhis2Import(file,mapping).then((fileResult)=>{
            setHtml(fileResult?.table); // update state
            setRows(fileResult?.data);
            setIsValidating(true);
            setConfirmed(false);
        });
    }
    const confirmData =()=>{
        setIsValidating(false);
        setRevalidated(true);
        setSelectedPeriod(periods?.find((p)=>p?.value === period));
    }
    const submitData = async ()=>{
        setIsValidating(false);
        setSubmitted(true);
        const sData = await workerFile.createDhis2Payload(rows, mapping, period, selected?.id, 'KRoNPjJgBy1',isLegacy);
        const dataValues = {
            dataValues: sData
        };
        mutate(dataValues);     
    }
    const handleOpen =(_e)=>{
        setOpen(true);
    }
    const handleClose =(_e)=>{
        setOpen(false);
    }
    const onClose =(_e)=>{
        setConfirmed(true);
        setRevalidated(false);
        submitData();
    }
    const onCancel =(_e)=>{
        setConfirmed(false);
        setRevalidated(false);
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
    React.useEffect(()=>{
        if(!isLoading){
            setMapping(smartcare);
        }
        else{
            setMapping([]);
        }
    },[isLoading,smartcare]);
    React.useEffect(()=>{
        if(!isLegacyGroupLoading){
            const checkLegacy = legacyGroup?.organisationUnitGroups?.some((l)=>l?.code === "SMARTCARE_LEGACY");
            setIsLegacy(checkLegacy);
        }
        else{
            setIsLegacy(false);
        }
    },[isLegacyGroupLoading,legacyGroup?.organisationUnitGroups]);
    return (
        <Container css={ classes.root }>
            {
                !isValidating?
                (
                    <Stack spacing= {2} alignItems={ 'flex-start'}>
                        <h3>SMARTCare Upload</h3>
                        <Divider/>  
                        <NoticeBox title={"How to submit the SMARTCARE Report"}>
                            Select the facility,reporting period and upload the SMARTCARE report.
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
                        <PeriodField
                            data ={ sortBy(periodTypes,'label') }
                            placeholder= { `Select Period Type` }
                            onChange = { onChangePeriodType }
                            selected = { periodType }
                            input = { periodType }
                            
                        />
                        <Divider/>  
                        <PeriodField      
                            data ={ sortBy(periods,"value") }
                            placeholder= { `Select Period` }
                            onChange = { onChangePeriod }
                            selected = { period }
                            multi = { false }
                        />          
                        <Divider/>         
                        <FileInputField
                            helpText="Please submit EXCEL report file from SMARTCARE"
                            label="Upload SMARTCARE Report"
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
                            confirmed?(
                                <Button
                                    name="Button"
                                    type="button"
                                    value="default"
                                    disabled ={ isCompleted || true}
                                >
                                   { isCompleted?"Submitted" : "Submitting" }
                                </Button>
                            ):(
                                <Button
                                    name="Button"
                                    onClick={ validateData }
                                    type="button"
                                    value="default"
                                >
                                    Review
                                </Button>
                            )
                        }
                        {
                            revalidate?(

                                <Modal onClose={onCancel} small>
                                    <Stack>
                                        <ModalTitle>
                                            Are you submitting SMARTCARE data for:
                                        </ModalTitle>
                                        <ModalContent>
                                            <Stack>
                                                <div css={ classes.label }>Facility: { selected?.name || selected?.displayName }</div>
                                                <div css={ classes.label }>Period: {  selectedPeriod?.label??""} </div>
                                                <div css={ classes.success }>Please click <b>"Yes"</b> to accept and  submit data</div>
                                                <div css={ classes.notice }><b>"No"</b> to cancel and restart the submission.</div>
                                            </Stack>
                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems="flex-start"
                                                spacing={8}
                                            >
                                                <Button onClick={ onClose } style={{
                                                    color: '#ffffff',
                                                    backgroundColor:  'green'
                                                } }>
                                                    Yes
                                                </Button>
                                                <Button onClick={ onCancel } destructive>
                                                    No
                                                </Button>
                                            </Stack>
                                        </ModalContent>                                        
                                    </Stack>
                                </Modal>
                            ):null
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

export default ManageMer;
