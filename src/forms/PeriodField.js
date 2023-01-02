import React from 'react';
import { 
    MultiSelect, 
    MultiSelectOption, 
    SingleSelect, 
    SingleSelectOption 
} from '@dhis2/ui';
import map from 'lodash/map';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
    select:{
        width: 240,
        position: 'relative'
    },
    selectx:{
        width: 240,
        left: '142%',
        position: 'relative'
    }
});
export const PeriodField =({ placeholder, data, selected, onChange, singleSelect,input })=>{
    const classes = useStyles();
    const singleSelection = singleSelect?singleSelect: false;
    return(
        singleSelection === false?
        (
            <div className = { classes.select }>
                <MultiSelect
                    initialFocus
                    className = { classes.select }
                    filterPlaceholder= { placeholder }
                    placeholder= { placeholder }
                    filterable
                    noMatchText="No match found for filter"
                    onChange={ onChange }
                    selected={ selected }
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
        ):
        (
            <div className = { classes.select }>
                <SingleSelect
                    initialFocus
                    className = { classes.select }
                    filterPlaceholder= { placeholder }
                    placeholder= { placeholder }
                    filterable
                    noMatchText="No match found for filter"
                    onChange={ onChange }
                    selected={ selected }
                    input = { input }
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
        )
    )
}
export default PeriodField;