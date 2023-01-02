import React from 'react';
import { Formik, FastField, FieldArray, Form } from 'formik';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from "@material-ui/core/ListItemIcon";
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
    select: {
        minWidth: 150,
        maxWidth: 400
    }
});
export const FormUi = ({title,fields,initialData,validationSchema,save,...rest}) => {

return(
  <div>
    <h1>{title}</h1>
    <Formik
       initialValues={ initialData}
       validationSchema= { validationSchema }
       onSubmit={(values, actions) => {
         setTimeout(() => {
           alert(JSON.stringify(values, null, 2));
           actions.setSubmitting(false);
         }, 1000);
       }}
     >
        {
            (props)=>
            (
                <Form>
                    <FormFields 
                        { ...props }
                        { ...rest }
                        fields= { fields }
                        save ={ save }
                        
                    />
                    {
                        save?(<Button name={save} type="submit">{save}</Button>):null
                    } 
                </Form>
            ) 
        }
     </Formik>       
  </div>
);
}

export default { FormUi };

export const FieldSet = ({ f,path,values,handleChange,touched,errors,...rest }) =>{
    const classes = useStyles();
    const [selected, setSelected] = React.useState([]);
    const isAllSelected =
    f?.options?.length > 0 && selected.length === f?.options?.length;
    const onHandleChange = (event) => {
        const value = event?.target?.value;
        if (value[value.length - 1] === "all") {
            setSelected(selected.length === f?.options?.length ? [] : f?.options);
            return;
        }
        setSelected(typeof value === 'string' ? value.split(',') : value);
        //handleChange(selected);
    }; 
    console.log("Value:",selected) 
    return (
        <FastField 
            name={path} 
            placeholder={f?.label??f?.name} 
            {...rest }
        >
            {
                ({ field })=>
                (f?.options && Array.isArray(f?.options))?(
                    <FormControl sx={{ m: 1, minWidth: 300 }}>
                        <InputLabel id={f?.name} shrink={ true }> {f?.label??f?.name} </InputLabel>
                        <Select 
                            sx={{ minWidth: 150 }}
                            className ={ classes.select }
                            autoWidth
                            {...field }
                            id= {f?.name }
                            name={ path }
                            label={f?.label??f?.name}
                            multiple = { f?.multiple?? false }
                            value={ selected }
                            onChange={ onHandleChange }
                            renderValue={(selected) => ((selected?.label?.join(', ')) || (selected?.join(', ')))}
                            error={touched?.f?.name && Boolean(errors?.f?.name)}
                        >
                        <MenuItem
                        value="all"
                        classes={{
                            root: isAllSelected ? classes.selectedAll : ""
                        }}
                        >
                            <ListItemIcon>
                                <Checkbox
                                classes={{ indeterminate: classes.indeterminateColor }}
                                checked={isAllSelected}
                                indeterminate={
                                    selected.length > 0 && selected.length < f?.options?.length
                                }
                                />
                            </ListItemIcon>
                            <ListItemText
                                classes={{ primary: classes.selectAllText }}
                                primary="Select All"
                            />
                            </MenuItem>
                            {
                                f.options?.map((option,ki) => (
                                    <MenuItem key={`${option.value || option}-${ki}` } value={ option }>
                                        <ListItemIcon>
                                            <Checkbox checked={selected.indexOf(option.label || option) > -1} /> 
                                        </ListItemIcon>                                        
                                        <ListItemText primary={ option.label || option} />
                                    </MenuItem>

                                ))
                            }
                        </Select>
                        <FormHelperText>{ touched?.f?.name && errors?.f?.name }</FormHelperText>
                    </FormControl>
                ):
                (
                    <TextField
                        {...field }
                        fullWidth
                        className ={ classes.select }
                        id= {f?.name }
                        name={ path}
                        label={f?.label??f?.name}
                        type="text"
                        value={values?.f?.name}
                        onChange={ handleChange }
                        error={touched?.f?.name && Boolean(errors?.f?.name)}
                        helperText={touched?.f?.name && errors?.f?.name}
                    />
                )
            }
        </FastField>
    )
}
export const FormFields =(props)=>{
    const { fields, path } = props;
    return(
        fields?.map((f,i)=>(
            Array.isArray(f?.items)?
            (
                <FieldArray name={f?.name} path={  path?`${path}${f?.name}`:`${f?.name}`} key={ `${f}-${i}`}>
                    {({ move, swap, push, remove,insert, unshift, pop, form }) => 
                        (
                            <>
                                <FormFields 
                                    key={ `arrayfield-${f}-${i}`}
                                    { ...props }
                                    fields = {f?.items} 
                                    path = { path?`${path}.${f?.name}.${i}.`:`${f?.name}.${i}.`} 
                                    f= { f } 
                                />
                                <Button
                                    type="button"
                                    onClick={() => remove(i)} // remove a friend from the list
                                >
                                    -
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => insert(i, '')} // insert an empty string at a position
                                >
                                    +
                                </Button>
                            </>
                        )
                    }
                </FieldArray>
            ):
            (

                <FieldSet 
                    { ...props }
                    key={ `${f}-${i}`}
                    path = { path?`${path}${f?.name}`:`${f?.name}` }
                    f= {f}
                />
            )
        ))

    )
}