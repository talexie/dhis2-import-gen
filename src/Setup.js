import React from 'react'
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/styles';
import useSWR from 'swr';
import { useConfig } from '@dhis2/app-runtime';
import { CenteredTabs } from './Tabs';
import { TabPanel } from './TabPanel';
import { DisplayTable } from './DisplayTable';
import { getTableColumns,createMoreColumns  } from './Utils';

const useStyles = makeStyles({
    root: {
        marginTop: 0,
        marginLeft: 20
    },
    title:{
        fontSize:14,
        backgroundColor: '#fff999'
    },
    tableHeader:{
        backgroundColor: 'rgb(18 20 22 / 29%)'
    }

});

const tabs =[
    {
        "label": "Report Types",
        "key": "reportTypes",
        "path" : "/setup/reporttypes"
    },
    {
        "label": "Reports",
        "key": "reports",
        "path" : "/setup/reports"
    }
]

const testdata ={
    "dimensions": [
      {
        "items": [],
        "key": "default",
        "name": "No Disaggregation"
      },
      {
        "items": [
          {
            "categoryOptions": [
              {
                "id": "fgbdgqWcsAB",
                "name": "Female"
              },
              {
                "id": "LEk48SLXafR",
                "name": "Male"
              }
            ],
            "id": "FSptXcFjcvi",
            "name": "Gender",
            "type": "CATEGORY"
          }
        ],
        "key": "gender",
        "name": "Gender (Male/Female)"
      },
      {
        "items": [
          {
            "categoryOptions": [
              {
                "id": "fgbdgqWcsAB",
                "name": "Female"
              },
              {
                "id": "LEk48SLXafR",
                "name": "Male"
              }
            ],
            "id": "FSptXcFjcvi",
            "name": "Gender",
            "type": "CATEGORY"
          },
          {
            "categoryOptions": [
              {
                "id": "nvHR2VyWnuj",
                "name": "<1"
              },
              {
                "id": "PcdIlcKn0f4",
                "name": "1-4"
              },
              {
                "id": "y8uclXNUv5e",
                "name": "5-9"
              },
              {
                "id": "WnPIBcUzZ3o",
                "name": "10-14"
              },
              {
                "id": "FVqENkrcDjc",
                "name": "15-19"
              },
              {
                "id": "fQ85I0gRoUF",
                "name": "20-24"
              },
              {
                "id": "HQDUxMAdYzS",
                "name": "25-29"
              },
              {
                "id": "h6JBfbddseR",
                "name": "30-34"
              },
              {
                "id": "pyXuDCRzvJx",
                "name": "35-39"
              },
              {
                "id": "PvhXL1PXIwc",
                "name": "40-44"
              },
              {
                "id": "FGDAfB9NAi4",
                "name": "45-49"
              },
              {
                "id": "nmnTJAAwyc5",
                "name": "50+"
              }
            ],
            "id": "dGlXlgOZKm3",
            "name": "Age Groups in Years",
            "type": "CATEGORY"
          }
        ],
        "key": "genderAgeGroup",
        "name": "Gender and Age Group"
      },
      {
        "items": [
          {
            "categoryOptions": [
              {
                "id": "nvHR2VyWnuj",
                "name": "<1"
              },
              {
                "id": "PcdIlcKn0f4",
                "name": "1-4"
              },
              {
                "id": "y8uclXNUv5e",
                "name": "5-9"
              },
              {
                "id": "WnPIBcUzZ3o",
                "name": "10-14"
              },
              {
                "id": "FVqENkrcDjc",
                "name": "15-19"
              },
              {
                "id": "fQ85I0gRoUF",
                "name": "20-24"
              },
              {
                "id": "HQDUxMAdYzS",
                "name": "25-29"
              },
              {
                "id": "h6JBfbddseR",
                "name": "30-34"
              },
              {
                "id": "pyXuDCRzvJx",
                "name": "35-39"
              },
              {
                "id": "PvhXL1PXIwc",
                "name": "40-44"
              },
              {
                "id": "FGDAfB9NAi4",
                "name": "45-49"
              },
              {
                "id": "nmnTJAAwyc5",
                "name": "50+"
              }
            ],
            "id": "dGlXlgOZKm3",
            "name": "Age Groups in Years",
            "type": "CATEGORY"
          }
        ],
        "key": "ageGroup",
        "name": "Age Groups in Years"
      },
      {
        "items": [
          {
            "categoryOptionGroups": [
              {
                "id": "G4bNVvzf8jZ",
                "name": "<15"
              },
              {
                "id": "dutGIGRnMdk",
                "name": "15+"
              }
            ],
            "id": "r7fzO9tznR3",
            "name": "Age Dimension <15 and 15+ ",
            "type": "CATEGORY_GROUP_SET"
          }
        ],
        "key": "lessThan15AndAbove15",
        "name": "<15 and 15+"
      },
      {
        "items": [
          {
            "categoryOptionGroups": [
              {
                "id": "G4bNVvzf8jZ",
                "name": "<15"
              },
              {
                "id": "dutGIGRnMdk",
                "name": "15+"
              }
            ],
            "id": "r7fzO9tznR3",
            "name": "Age Dimension <15 and 15+ ",
            "type": "CATEGORY_GROUP_SET"
          },
          {
            "categoryOptions": [
              {
                "id": "fgbdgqWcsAB",
                "name": "Female"
              },
              {
                "id": "LEk48SLXafR",
                "name": "Male"
              }
            ],
            "id": "FSptXcFjcvi",
            "name": "Gender",
            "type": "CATEGORY"
          }
        ],
        "key": "lessThan15AndAbove15AndGender",
        "name": "Gender, <15 and 15+"
      }
    ],
    "filterMechanism": "tIC3uGX8SIq:bADxvHIzcQM",
    "levels": [
      {
        "level": 1,
        "name": "District"
      },
      {
        "level": 2,
        "name": "Province"
      }
    ],
    "mechanism": "UyVfIMhEh0B",
    "reports": [
      {
        "dataGroups": [],
        "enabled": true,
        "frequency": "Monthly",
        "id": 1,
        "indicator": true,
        "key": "datimQuarterly",
        "location": true,
        "name": "DATIM Quarterly",
        "reportType": "DATIM"
      },
      {
        "dataGroups": [
          {
            "id": "",
            "name": "",
            "type": "INDICATOR_GROUP"
          }
        ],
        "enabled": true,
        "frequency": "Quarterly",
        "id": 2,
        "indicator": true,
        "key": "datimSnapshotIndicators",
        "location": true,
        "name": "DATIM SNAPSHOT Indicators",
        "reportType": "DATIM"
      },
      {
        "dataGroups": [],
        "enabled": true,
        "frequency": "Monthly",
        "headers": [
          {
            "field": "organisationUnit1",
            "name": "Org Unit",
            "order": 1,
            "active":"true"
          },
          {
            "field": "value1",
            "name": "Value",
            "order": 2,
            "active":"true"
          }
        ],
        "id": 3,
        "indicator": false,
        "key": "hfr",
        "location": true,
        "name": "HFR",
        "reportType": "HFR",
        "filterMechanism": "tIC3uGX8SIq:bADxvHIzcQM",
        "levels": [
          {
            "level": 1,
            "name": "District"
          },
          {
            "level": 2,
            "name": "Province"
          }
        ],
        "mechanism": "UyVfIMhEh0B"
      }
    ],
    "reporttypes": [
      {
        "id": 1,
        "name": "DATIM"
      },
      {
        "id": 2,
        "name": "HFR"
      },
      {
        "id": 3,
        "name": "BOB"
      }
    ]
  }
export const Setup = () => {    
    const classes = useStyles();
    const { baseUrl } = useConfig();
    const { data,error } = useSWR(`${baseUrl}/api/dataStore/terminology/config`);
    const [value, setValue] = React.useState(0);
    const [label, setLabel] = React.useState('reportTypes');
    const [setupData,setSetupData] = React.useState({ data:[],columns:[]});
    //const [d, setD] = React.useState([]);

    const handleChange = (_event, newValue) => {
        setValue(newValue);  
        const title = tabs?.find((_t,i)=> i === newValue );
        setLabel(title?.key); 
    };
    React.useEffect(()=>{
        const columns = createMoreColumns([],getTableColumns(data?.[label]));
        if(data){
          setSetupData({ data: data?.[label] , columns: columns });
        }       
    },[label,data]);
    return (
        !error?
        (
            <Grid container spacing={2} className={ classes.root } direction= { 'column' } >
                <Grid item>
                    <h3>Configure Mapping Settings</h3>
                </Grid>            
                <Grid item container direction="row" spacing={1} alignItems="flex-start">
                    <Grid item xs={12} sm={12} md={5} lg={2} xl={2}>
                        <CenteredTabs 
                            orientation="vertical" 
                            options={ tabs }
                            onChange = { handleChange }
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={9} xl={9}>
                        <TabPanel value={value} index={ value }>
                            <DisplayTable 
                                actionsAllowed ={ true} 
                                title = { label } 
                                columns= { setupData?.columns } 
                                data = { setupData?.data } 
                                config = { data }
                                pageSize= {10}
                            />
                        </TabPanel>
                    </Grid>
                                                 
                </Grid>
            </Grid>
        ):(
            <Grid container className={ classes.root } direction= { 'column' } >
                <Grid item>
                    <h3>Configure Mapping Settings</h3>
                </Grid>            
                <Grid item>
                    <span>{ `ERROR: ${error}` }</span>
                </Grid>
            </Grid>
        )
    )
}

export default Setup;
