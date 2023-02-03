import * as React from 'react'
import { Icon } from './Icon';
import {
    Checkbox,
    FormControlLabel
 } from '@mui/material';
import { css }  from '@emotion/react';

const  spanCss =css({
    display: 'inline-block',
    marginRight: '4px'
});
export const IconizedCheckbox = ({
    checked,
    hasChildren,
    indeterminate,
    children,
    loading,
    name,
    open,
    value,
    onChange
}) => {
    return (
        <FormControlLabel 
            control={
                <Checkbox
                    checked={checked}
                    name={name}
                    value={value}
                    disableRipple = { true }
                    indeterminate={indeterminate}
                    onChange={onChange}
                    size="small"
                />
            }
            label= { 
                <>
                    <span css= { spanCss }>
                        <Icon
                            loading={loading}
                            open={open}
                            hasChildren={hasChildren}
                        />
                    </span>
                    { children } 
                </>
            }
        />

    )
}
/*
export interface IconizedCheckbox {
    checked: boolean,
    children,
    hasChildren: boolean,
    indeterminate: boolean,
    loading: boolean,
    name,
    open: boolean,
    value,
    onChange: ()=>void,
}*/
