import React from 'react';
import { Grid, Paper } from '@material-ui/core';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { TextInput } from './TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';
import { makeStyles } from '@material-ui/core/styles';
import { enumOptions, omitKey } from './Helpers';
import { periodTypes  } from '../Period';
import omit from 'lodash/omit';
import { useConfig } from '@dhis2/app-runtime';

const useStyles = makeStyles(
    {
        stepContent:{
            width: '100%',
            marginBottom: '32px',
        },
        root:{
            minWidth: '30%',
            paddingTop: '8px',
            paddingBottom: '8px'
        }
    }
);

export const Reports =(props)=>{
    const { config, getData,data } = props;
    const classes = useStyles();
    const [reports, setReports] = React.useState(data);
    const { baseUrl } = useConfig();
    const [loading,setLoading] = React.useState(true);
    const [categories,setCategories] = React.useState([]);
    const [selectedCategory,setSelectedCategory] = React.useState(undefined);
    const handleChange = (event) => {
      let mergedReports = { 
        ...reports, 
        [event.target.name]: event.target.value 
      } 
      if(event.target.name === 'category'){
        const selectedOption = categories?.find((d)=>d?.id === event?.target?.value);
        setSelectedCategory(selectedOption);
        mergedReports = {
          ...reports,
          category: omit(selectedOption,['categoryOptions'])
        }
      }
      setReports(mergedReports);
      getData(mergedReports);
    };
    const handleChecked = (event) => {
      const mergedCheckReports = { 
        ...reports, 
        [event.target.name]: event.target.checked 
      }
      setReports(mergedCheckReports);
      getData(mergedCheckReports);
    };
    const { 
      location, 
      indicator,
      reportType,
      name,
      frequency,
      mappingEnabled,
      mechanism,
      mechanismName,
      category,
      categoryOption 
    } = reports;

    React.useEffect(()=>{ 
      let unmounted = false;
      const getDhis2Categories= async()=> {
          const response = await fetch(`${baseUrl}/api/categories?fields=id,name,categoryOptions[name,id]&paging=false&filter=dataDimensionType:eq:ATTRIBUTE`);
          const dhis2data = await response.json();
          setCategories(dhis2data?.categories); 
          setLoading(false);  
      }
      getDhis2Categories();
      return () => {
          unmounted = true;
      };  
    },[baseUrl]);
    return(
        <Paper className ={ classes.stepContent}elevation = {0}>
          <Grid className ={ classes.stepContent}>
            <form noValidate autoComplete="off">
              <Grid item>
                <TextInput
                  label={ 'Type'}
                  select ={  true }
                  data={ reportType }
                  onChange={ handleChange }
                  id = { "reportType"}
                  helperText= { "Please select type of report"}
                  options = { enumOptions(config['reportTypes'])}
                />
              </Grid>
              <Grid item>
              <TextInput
                  label={ 'Name'}
                  data={ name }
                  onChange={ handleChange }
                  id = { "name"}
                  name = { "name"}
                />
              </Grid>
              <Grid item>
              <TextInput
                  label={ 'Frequency'}
                  select ={  true }
                  data={ frequency }
                  onChange={ handleChange }
                  id = { "frequency"}
                  options = { enumOptions( periodTypes )}
                />
              </Grid>
              <Grid item>
                  <TextInput
                      label={ 'Mechanism ID'}
                      data={ mechanism }
                      onChange={ handleChange }
                      id = { "mechanism"}
                      name = { "mechanism"}
                      helperText= { "Enter attribution from the system e.g DATIM Mechanism ID"}
                  />
              </Grid>
              <Grid item>
                  <TextInput
                      label={ 'Mechanism Description'}
                      data={ mechanismName }
                      onChange={ handleChange }
                      id = { "mechanismName"}
                      name = { "mechanismName"}
                  />
              </Grid>
              <Grid item>
                  <TextInput
                      label={ 'Project Category'}
                      data={ category?.id }
                      onChange={ handleChange }
                      id = { "category"}
                      name = { "category"}
                      select = { true }
                      disabled = { loading }
                      options = { enumOptions( omitKey(categories,'categoryOptions'),'name','id' )}
                  />
              </Grid>
              <Grid item>
                  <TextInput
                      label={ 'Project'}
                      data={ categoryOption }
                      onChange={ handleChange }
                      id = { "categoryOption"}
                      name = { "categoryOption"}
                      select = { true }
                      options = { enumOptions( selectedCategory?.categoryOptions,'name','id')}
                  />
              </Grid>
              <Grid item>
                <FormControl component="fieldset" className ={ classes.root }>
                  <FormLabel component="legend">Mapping enabled</FormLabel>
                  <RadioGroup row aria-label="Mapping enabled" name="mappingEnabled" value={ mappingEnabled?"true":"false" } onChange={ handleChange}>
                    <FormControlLabel value={ "true" } control={<Radio />} label="Yes" />
                    <FormControlLabel value={ "false" } control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl component="fieldset" className={classes.root}>
                  <FormLabel component="legend">Enable Mappings</FormLabel>
                  <FormHelperText>Check to enable mappings</FormHelperText>
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox checked={location} onChange={handleChecked} name="location" />}
                      label="Location"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={indicator} onChange={handleChecked} name="indicator" />}
                      label="Indicator"
                    />
                    
                  </FormGroup>
                </FormControl>
              </Grid>
            </form>
          </Grid>
        </Paper>
    );
}