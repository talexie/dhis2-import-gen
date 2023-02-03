import React from 'react';
import { 
    MultiSelect, 
    MultiSelectOption, 
    SingleSelect, 
    SingleSelectOption 
} from '@dhis2/ui';
import map from 'lodash/map';
import { css } from '@emotion/react';

const classes = {
    select:css({
        position: 'relative',
        textAlign: 'left'
    })
};
export const PeriodField =({ placeholder, data, selected, onChange,multi=false,clearable=false })=>{
    const handleChange =(e)=>{
        onChange(e);
    }
    return(
        !multi?
        (
            <div css = { classes.select }>
                <SingleSelect
                    initialFocus
                    css= { classes.select }
                    filterPlaceholder= { placeholder }
                    placeholder= { placeholder }
                    filterable
                    noMatchText="No match found"
                    onChange={ handleChange }
                    selected={ selected?.toString() }
                    clearText="Clear"
                    clearable ={ clearable }
                >
                {
                    map(data,(field,p)=>{
                        return(
                            <SingleSelectOption
                            key = { `${field.label}-${p}`}
                            label={ field.label }
                            value={ field.value }
                            />
                        )
                    })
                }
                
                </SingleSelect>
            </div> 
        ):
        (
            <div css= { classes.select }>
                <MultiSelect
                    initialFocus
                    css = { classes.select }
                    filterPlaceholder= { placeholder }
                    placeholder= { placeholder }
                    filterable
                    noMatchText="No match found"
                    onChange={ handleChange }
                    selected={ selected??[] }
                    clearText="Clear"
                    clearable ={ clearable }
                >
                {
                    map(data,(field,pi)=>{
                        return(
                            <MultiSelectOption
                            key = { `${field.label}-${pi}`}
                            label={ field.label }
                            value={ field.value }
                            />
                        )
                    })
                }
                
                </MultiSelect>
            </div>
        )
        
    )
}
export default PeriodField;