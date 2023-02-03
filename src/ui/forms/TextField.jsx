import React from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { css } from '@emotion/react';
import isEmpty from 'lodash/isEmpty';
const classes=
    {
        root: css({
            minWidth: '30%',
            paddingTop: '8px',
            paddingBottom: '8px'
        })
    }
export const TextInput =(props)=>{
    const { 
        label, 
        required = false,
        enabled,
        name,
        data,
        type,
        id,
        select = false,
        options,
        onChange,
        onClick,
        helperText,
        readOnly 
    } = props;
    return(
        <TextField
            {...props}
            css={ classes.root }
            label={ label }
            type = { type??'string' }
            select = { select?? false}
            value={ data??'' }
            onChange={ onChange}
            onClick = { onClick}
            id = { id}
            name = { id??name}
            required = { required?? false}
            disabled = { enabled?? false}
            helperText= { helperText??''}
            InputLabelProps={{ shrink: true }}
            inputProps ={{
                readonly: readOnly?? false
            }}
            >
        {
        select && !isEmpty(options)?(
            options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))
        ):
        (
            <MenuItem key={`no-option-${label}`} value={''}>
                Select { label }
            </MenuItem> 
        )
        }
        </TextField>
    );
}