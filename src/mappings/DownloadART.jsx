import * as React from 'react';
import { css } from '@emotion/react';
import { Button, Divider, NoticeBox, CircularLoader, InputField } from '@dhis2/ui';
import { Container, Stack } from '@mui/material';
import { useState } from 'react';
import {   OrgUnitControl, useOrgUnit } from '../ui';
import 'react-data-grid/lib/styles.css';
import {  useQuery } from 'react-query';
import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';
import { saveAs } from 'file-saver';
import { format, sub } from 'date-fns';


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
  
export const DownloadART = () => {   
    const [open, setOpen ] = useState(false); 
    const [startDate, setStartDate ] = useState(undefined);
    const [endDate, setEndDate ] = useState(undefined);
    const [selected, setSelected ] = React.useState([]);
    const { organisationUnitId, handleOrganisationUnitChange} = useOrgUnit();
    const dateFilter = `${startDate?`&occurredAfter=${startDate}`:``}${endDate?`&occurredBefore=${endDate}`:``}`
    const { data: fileResources, error:fileResourcesError, isLoading } = useQuery({
        queryKey: [`tracker/events.json?program=j1plKUVQMq4&skipPaging=true&fields=completedAt,occurredAt,orgUnit,orgUnitName,event,dataValues[dataElement,value]${dateFilter}${selected?.id?`&ouMode=DESCENDANTS&orgUnit=${selected?.id}`:``}`]
    });
    const getZipFile =async(files)=>{
        const zip = new JSZip();
        let count = 0;
        const zipFilename = `ART_Registers_${ format(new Date(),'yyyy-MM-dd')}.zip`;

        files.forEach((url)=> {
        console.log(url);
        const  filename = `ART_Register_${selected?.parent?.name??''}_${url?.orgUnitName}_${url?.occurredAt?.split('T')?.[0]}_${url?.event}.xlsx`;
       
        // loading a file and add it in a zip file
        JSZipUtils.getBinaryContent(
            `../../events/files?dataElementUid=CYHDjier8OI&eventUid=${url?.event}`,
            (err,data)=> {
                if (err) {
                    throw err; // or handle the error
                }
                zip.file(filename, data, { binary: true });
                count++;
                if (count === files.length) {
                    zip.generateAsync({ type: 'blob' }).then(function (content) {
                        saveAs(content, zipFilename);
                    });
                }
            })
        });
    }
    const submitData = async ()=>{
        getZipFile(fileResources?.instances);
    }

    const handleOpen =(_e)=>{
        setOpen(true);
    }
    const handleClose =(_e)=>{
        setOpen(false);
    }
    const onChangeStartDate=({value})=>{
        setStartDate(value??format(sub(new Date(),{ days:30}),'yyyy-MM-dd'));     
           
    }
    const onChangeEndDate=({ value })=>{
        setEndDate(value??format(new Date(),'yyyy-MM-dd'));  
    }
    const getOrgUnit =(value)=>{
        setSelected(value);
    }
    return (
        <Container css={ classes.root }>
            <Stack spacing= {2} alignItems={ 'flex-start'}>
                <h3>Download ART Registers</h3>
                <Divider/>  
                <NoticeBox title={"How to download ART Registers"}>
                    Select an organisation unit and/or date range to download a specific file(s) into a zipped file. If no organisation unit or date selections are made, all files currently in the system will be downloaded into a zipped file.
                </NoticeBox>
                
                {
                        isLoading?(<CircularLoader />):null
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
                                    enableSelectionLevel ={ false }
                                />
                            </div>
                                    
                        ): null
                    }
                </div>     
                <Divider/>  
                <InputField
                    label= { `Start Date` }
                    name ={ `startDate`}
                    onChange = { onChangeStartDate }
                    type ={ 'date'}
                    value = { startDate }
                    
                />
                <Divider/>  
                <InputField      
                    label= { `End Date` }
                    name ={ `endDate`}
                    onChange = { onChangeEndDate }
                    type ={ 'date'}
                    value = { endDate }
                />                                  
                <Divider/>
                <Button
                    name="Button"
                    onClick={ submitData }
                    type="button"
                    value="default"
                >
                    Download
                </Button>
            </Stack>
        </Container>
    )
}

export default DownloadART;
