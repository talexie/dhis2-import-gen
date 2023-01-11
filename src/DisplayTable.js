import React, { forwardRef } from 'react';
import MaterialTable,{ MTableToolbar, MTableHeader, Paper as MTPaper, MTableEditField} from 'material-table';
import  { AccountCircle,Favorite,FavoriteBorder,AddBox,ArrowUpward, Check,ChevronLeft,ChevronRight, Clear,Edit,FirstPage,LastPage,Remove,SaveAlt,Save,Search,ViewColumn,DeleteOutline } from '@material-ui/icons';
import clsx from 'clsx';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Card,
  CardContent,
  Paper
} from '@material-ui/core';
import { CustomizedStepper} from './forms/CustomizedStepper';
import { useConfig } from '@dhis2/app-runtime';
import omit from 'lodash/omit';
import isPlainObject from 'lodash/isPlainObject';
import startCase from 'lodash/startCase';
import { exportDataToExcel } from './Utils';

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
    ThirdtdataCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
    Save: forwardRef((props, ref) => <Save {...props} ref={ref} />),
    AccountCircle: forwardRef((props, ref) => <AccountCircle {...props} ref={ref} />),
    Favorite: forwardRef((props, ref) => <Favorite {...props} ref={ref} />),
    FavoriteBorder: forwardRef((props, ref) => <FavoriteBorder {...props} ref={ref} />)
  };

  const useStyles = makeStyles({
    root: {},
    content: {
      padding: 0
    },
    inner: {
      minWidth: 1050
    },
    nameContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    actions: {
      justifyContent: 'flex-end'
    },
    tableHeader:{
      backgroundColor: 'hsla(210, 13%, 73%, 0.29)',
    },
    tableCell:{
      backgroundColor: 'hsla(210, 13%, 73%, 0.29)',
      borderRadius: '4px',
    },
    buttonDownload:{
      left: '56%',
      marginTop: '-4%',
      marginRight: '-25%',
      backgroundColor: '#57676e'
    },
    buttonAdd:{
      left: '56%',
      marginTop: '-4%',
      marginRight: '-35%',
      backgroundColor: '#57676e'
    }
  });

export const DisplayTable = ( props )=> {
  const { 
    config,
    actionsAllowed,
    columns,
    loading, 
    data,
    title, 
    className, 
    error, 
    totalCount,
    filtering,
    exportButton, 
    grouping,
    search,
    pageSize,
    selection,
    draggable,
    ...rest 
  } = props;
  const classes = useStyles();
  const { baseUrl } = useConfig();
  const [tableData, setTableData]=React.useState([]);
  const [isEdit, setIsEdit] = React.useState(false);
  const [editData, setEditData] = React.useState([]);
  const [success, setSuccess] = React.useState(undefined);
  const [saving, setSaving] = React.useState('SAVING');
  const initialPageSize = pageSize?pageSize:25;
  const options = {
    exportButton: exportButton?exportButton:true,
    filtering: filtering?filtering:true ,
    pageSize: initialPageSize,
    search: search?search:true,
    grouping: grouping?grouping:false,
    selection: selection?selection:false,
    pageSizeOptions: [10,25,50,100,250,500,1000,5000,10000,50000],
    draggable: draggable?draggable: true
  };
  const downloadData =(_e)=>{
    const d=[
        {
          "active": "true",
          "field": "organisationUnit1",
          "name": "Org Unit",
          "order": 1
        },
        {
          "active": "true",
          "field": "value1",
          "name": "Value",
          "order": 2
        },
        {
          "active": "true",
          "field": "datimId",
          "name": "datimId",
          "order": "0"
        },
        {
          "active": "true",
          "field": "datimName",
          "name": "datimName",
          "order": "1"
        },
        {
          "active": "true",
          "field": "District",
          "name": "District",
          "order": "5"
        },
        {
          "active": "true",
          "field": "datim",
          "name": "datim Details",
          "order": "1",
          "row": "1",
          "spanFields": "datimCode,datimUid,datimDisaggregation"
        },
        {
          "active": "true",
          "field": "test1",
          "name": "test Name",
          "order": "10",
          "row": "1",
          "spanFields": "value,datimId,datimName"
        },
        {
          "active": "true",
          "field": "spannedFieldName",
          "name": "Spanned name",
          "order": "",
          "row": 1,
          "spanFields": "value,orgUnit"
        }
      ];
    return exportDataToExcel(tableData,columns,undefined,`${title } Report`,"Sheet01");
  }
  const addRow =(_e)=>{
    setIsEdit(true);
    setEditData([]);
  }
  const submitData =(eventData,step,type)=>{
    if(step ==='COMPLETED'){     
      let updatedTypeConfig = config?.[type]?.map((t)=>{
        if(t?.id === eventData?.id){
          return {
            ...t,
            ...omit(eventData,['tableData'])
          }
        }
        else{
          return t;
        }
      });
      if(isPlainObject(eventData) && !eventData.hasOwnProperty('id') && config?.[type]){
        eventData.id = config?.[type].length + 1;
        updatedTypeConfig.push(eventData);
      }
      const updatedConfig = {
        ...config,
        [type]: updatedTypeConfig
      }
      fetch(`${baseUrl}/api/dataStore/terminology/config`,{
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedConfig)
      })
      .then((result)=>{
        setSuccess(result);
        setIsEdit(false);
        setSaving('COMPLETED');
      })
    }
    setEditData(eventData);
    if(isEdit){
      new Promise((resolve, reject) => {
        setTimeout(() => {
          const dataUpdate = [...tableData];
          const index = eventData?.tableData?.id;
          dataUpdate[index] = eventData;
          setTableData([...dataUpdate]);
          resolve();
        }, 1000)
      })
    }
    else{
      new Promise((resolve, reject) => {
        setTimeout(() => {
          setTableData([...tableData, eventData]);
          resolve();
        }, 1000)
      })
    }
  }
  React.useEffect(()=>{
    setTableData(data);
  },[data]);
  return (
    !isEdit?(
    <MaterialTable
      icons = { tableIcons }
      title= { startCase(title) }
      isLoading = { loading }
      columns={ columns??[] }
      data={ tableData }
      components={{
          Toolbar: props => (
              <div style={{ backgroundColor: 'hsla(210, 13%, 73%, 0.29)' }}>
                  <MTableToolbar {...props} />
                  <Button className={classes.buttonDownload } color="primary" variant="contained" 
                    onClick={ downloadData }
                  >
                    Download Excel
                  </Button>
                  {
                    actionsAllowed?
                    (
                      <Button className={classes.buttonAdd }  color="primary" variant="contained" 
                        onClick={ addRow }
                      >
                        Add
                      </Button>
                    ): null
                  }
              </div>
          ),
          Header: props => (
            <MTableHeader className={ classes.tableHeader } {...props} />
          ),
          EditField: props => (
            <MTableEditField className={ classes.tableCell } { ...props }/>
          ),
          MTPaper : props => (
            <Card
              {...rest}
              className={clsx(classes.root, className)}
            >
              <CardContent className={classes.content}>
                <PerfectScrollbar>
                  <div className={classes.inner}>
                    <MTPaper { ...props } elevation={ 0 } />
                  </div>
                </PerfectScrollbar>
              </CardContent>

            </Card>
          )
        }
      }
      actions={ actionsAllowed && [
        {
          icon: 'save',
          tooltip: 'Edit',
          onClick: (_event, rowData) =>{
            setIsEdit(true);
            setEditData(rowData);
          }
        },
        {
          icon: 'delete',
          tooltip: 'Delete',
          onClick: (_event, oldData) => {
            // Do save operation
            new Promise((resolve, reject) => {
              setTimeout(() => {
                const dataDelete = [...tableData];
                const index = oldData.tableData.id;
                dataDelete.splice(index, 1);
                setTableData([...dataDelete]);
                resolve()
              }, 1000)
            })
          }
        }
      ]}
      /*detailPanel={ rowData => {
        setEditData(rowData);
        return (
          actionsAllowed? (
            <Paper>
              { title }
              <Grid container >
                <CustomizedStepper 
                  data={ rowData } 
                  getData = { submitData }
                  config = { config }
                  success= { success }
                  saving ={ saving }
                />
              </Grid>
            </Paper>
          ):null
        )
      }}*/
      onRowClick={ (_event, _rowData, togglePanel) => actionsAllowed && togglePanel()}
      options={ options }
    />):
    (
      <Paper>
        { startCase(title) }
        <CustomizedStepper 
          data={ editData } 
          getData = { submitData }
          config = { config }
          success= { success }
          saving ={ saving }
        />
      </Paper>
    )
  );
}
export default DisplayTable;
