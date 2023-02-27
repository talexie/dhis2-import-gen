import { NoticeBox } from '@dhis2/ui';
import { Stack } from '@mui/material';
import * as React from 'react';

export const ImportFeedBack = (props)=>{
    const { message, title, type } = props;
    if(type === 'SUCCESS'){
        return(
            <NoticeBox valid title={ title??"Data has been imported successfully."}>
                <Stack>
                    <div>Imported: { message?.importCount?.imported} </div>
                    <div>Updated: { message?.importCount?.updated} </div>
                    <div>Ignored: { message?.importCount?.ignored} </div>
                    <div>Deleted: { message?.importCount?.deleted} </div>
                </Stack>
            </NoticeBox>
        )
    }
    else if(type === 'WARNING'){
        return(
            <NoticeBox warning title={ title??"Data has not been imported successfully."}>
                <Stack>
                    <div>Imported: { message?.importCount?.imported} </div>
                    <div>Updated: { message?.importCount?.updated} </div>
                    <div>Ignored: { message?.importCount?.ignored} </div>
                    <div>Deleted: { message?.importCount?.deleted} </div>
                </Stack>
            </NoticeBox>
        )
    }
    else{
        return null;
    }
    
}