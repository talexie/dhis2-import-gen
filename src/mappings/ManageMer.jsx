import * as React from 'react';
import { css } from '@emotion/react';
import { FileInputField, Button, Divider, NoticeBox, FileListItem } from '@dhis2/ui';
import { Container, Stack } from '@mui/material';
import { useState } from 'react';
import { useOrgUnit,PeriodField, OrgUnitControl } from '../ui';
import sortBy from 'lodash/sortBy';
import { generatePeriods, getPeriodTypes } from '../utils';
import {createWorkerFactory, useWorker} from '@shopify/react-web-worker';

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
};
const periodTypes = getPeriodTypes(['Monthly','Quarterly']);
export const ManageMer = () => {   
    const [open, setOpen ] = useState(false); 
    const workerFile = useWorker(createWorker);
    const [periodType, setPeriodType ] = React.useState(undefined);
    const [period, setPeriod ] = React.useState(undefined);
    const [periods, setPeriods ] = React.useState([]);
    const [file, setFile ] = React.useState(undefined);
    const [fileName, setFileName ] = React.useState(undefined);
    const [selected, setSelected ] = React.useState([]);
    const { organisationUnitId, handleOrganisationUnitChange} = useOrgUnit();
    const onChangePeriodType=({selected})=>{
        setPeriod(undefined);
        setPeriodType(selected);        
        const generatedPeriods = generatePeriods(selected,true);
        setPeriods(generatedPeriods);
    }
    const onChangePeriod=({ selected })=>{
        setPeriod(selected);  
    }
    const getOrgUnit =(value)=>{
        setSelected(value);
    }
    const upload=async()=>{
        /*return getUpdate({ 
            period: period, 
            orgUnit: selected?.id,
            submitted:  true
        });*/
        // Process data
        return workerFile.createDhis2Import(file).then((fileResult)=>{
            console.log("Result:::",fileResult);
        })

    }
    const handleOpen =(_e)=>{
        setOpen(true);
    }
    const handleClose =(_e)=>{
        setOpen(false);
    }
    const onChange =(fileObject,_e)=>{
        const {  files } = fileObject;
        
        setFileName(files[0]?.name);
        //setFile(files[0]);
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
                <h3>SMARTCare Upload</h3>
                <Divider/>  
                <NoticeBox title={"How to submit the SMARTCARE Report"}>
                    Select the facility,reporting period and upload the SMARTCARE report.
                </NoticeBox>
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
                    multi = { true }
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
                <Button
                    name="Button"
                    onClick={ upload }
                    type="button"
                    value="default"
                >
                    Submit
                </Button>
            </Stack>
        </Container>
    )
}

export default ManageMer;
