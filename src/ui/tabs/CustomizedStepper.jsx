import React from 'react';
import PropTypes from 'prop-types';
import { css } from '@emotion/react';
import clsx from 'clsx';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import VideoLabelIcon from '@mui/icons-material/VideoLabel';
import StepConnector from '@mui/material/StepConnector';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { DataHeaders,DataGroupings,Reports,Levels,ReportTypes } from '../forms';
import { useLocation, useNavigate } from 'react-router-dom';
import toLower from 'lodash/toLower'

const ColorlibConnector ={
  alternativeLabel:  css({
    top: 22,
  }),
  active:  css({
    '& $line': {
      backgroundImage:
        'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
    },
  }),
  completed:  css({
    '& $line': {
      backgroundImage:
        'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
    },
  }),
  line:  css({
    height: 3,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
  }),
};

const useColorlibStepIconStyles = {
  root:  css({
    backgroundColor: '#ccc',
    zIndex: 1,
    color: '#fff',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  active: css({
    backgroundImage:
      'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  completed:  css({
    backgroundImage:
      'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
  }),
};

const ColorlibStepIcon=(props)=> {
  const classes = useColorlibStepIconStyles;
  const { active, completed } = props;

  const icons = {
    1: <SettingsIcon />,
    2: <GroupAddIcon />,
    3: <VideoLabelIcon />,
  };

  return (
    <div
      css={clsx(classes.root, {
        [classes.active]: active,
        [classes.completed]: completed,
      })}
    >
      {icons[String(props.icon)]}
    </div>
  );
}

ColorlibStepIcon.propTypes = {
  /**
   * Whether this step is active.
   */
  active: PropTypes.bool,
  /**
   * Mark the step as completed. Is passed to child components.
   */
  completed: PropTypes.bool,
  /**
   * The label displayed in the step icon.
   */
  icon: PropTypes.node,
};

const classes=(theme) => ({
  root:  css({
    width: '100%',
  }),
  stepContent:  css({
    width: '90%',
    padding: '32px'
  }),
  button:  css({
    marginRight: theme.spacing(1),
  }),
  instructions:  css({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    color: "green"
  }),
  failed:  css({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    color:"red"
  }),
  saving:  css({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    color:"yellow"
  }),
});

const  getSteps=(route)=> {
  const { pathname } = route;
  if(pathname?.includes('setup/reports')){
    return ['Report', 'Data Groupings','Administrative Levels','Headings'];
  }
  else if(pathname?.includes('setup/reporttypes')){
    return ['Report Types'];
  }
  else{
    return ['Report', 'Data Groupings','Administrative Levels','Headings'];;
  }
  
}

const GetStepContent =(props)=>{
  const { step, getData,route,type } = props; 
  const { pathname } = route;
  switch (step) {
    case 0:
      if(pathname?.includes('setup/reports')){
        return (
          <Reports
            { ...props} 
            getData = { getData } 
          />
        );
      }
      else if(pathname?.includes('setup/reporttypes')){
        return (
          <ReportTypes
            { ...props} 
            getData = { getData } 
          />
        );
      }
      else{
        return (
          <ReportTypes
            { ...props} 
            getData = { getData } 
          />
        );
      }
    case 1:
      return (
        <DataGroupings 
          { ...props} 
          getData = { getData } 
        />
      );
    case 2:
      return (
        <Levels 
          { ...props} 
          getData = { getData } 
        />
      );
    case 3:
      return (
        <DataHeaders 
          { ...props} 
          getData = { getData } 
        />
      );
    default:
      return 'Unknown step';
  }
}
const createTypes = (route)=>{
  const { pathname } = route;
  if(pathname?.includes('setup/reports')){
    return 'reports';
  }
  else if(pathname?.includes('setup/reporttypes')){
    return 'reportTypes';
  }
  else{
    return 'reports';
  }
}
export const CustomizedStepper =(props)=>{
  const { data, reporttypes, config, success, saving, getData  = ()=>{} } = props;
  const route = useLocation();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = React.useState(0);
  const [rowData, setRowData] = React.useState(data??[]);

  const steps = getSteps(route);
  const type = createTypes(route);

  const handleNext = (_e) => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    if(activeStep === (steps.length - 1)){
      getData(rowData,'COMPLETED',type); 
    }
    else{
      getData(rowData); 
    }       
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    getData(rowData);
  };
 
  const handleReset = () => {
    setActiveStep(0);
    setRowData(rowData??[]);
  };
  const goBackHome =(_e)=>{
    navigate(`/setup/${ toLower(type)}`);
  }
  const getGroupData = (d) => {
      setRowData({
        ...rowData,
        ...d
      });  
  };
  return (
    <div css={classes.root}>
      <Stepper alternativeLabel activeStep={activeStep} connector={<StepConnector />}>
        {steps?.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
        {activeStep === steps.length ? (
          <div>
            { 
              saving === 'COMPLETED'?
              (
                (success?.status === 'OK') && (success?.httpStatusCode === 200)?(
                  <Typography css={classes.instructions}>
                    Configuration saved.
                  </Typography>
                ):
                (
                  <Typography css={classes.failed}>
                    Saving configuration failed.
                  </Typography>
                )
              ):
              (
                <Typography css={classes.saving}>
                  Saving configuration .....
                </Typography>
              )
            }
            
            <Button onClick={handleReset} css={classes.button}>
              Reset
            </Button>
          </div>
        ) : (
          <div css= { classes.stepContent }>
            <Typography css={classes.instructions}>
              <GetStepContent      
                config = { config }
                step={ activeStep} 
                route = { route }
                label ={ steps[activeStep] }
                reporttypes ={ reporttypes } 
                getData={ getGroupData } 
                data = { rowData }
                type ={ type }
              />
            </Typography>
            <div>
              <Button disabled={activeStep === 0} onClick={handleBack} css={classes.button}>
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={ handleNext }
                css={classes.button}
              >
                {activeStep === steps.length - 1 ? 'Save' : 'Next'}
              </Button>
              <Button onClick={goBackHome} css={classes.button}>
                Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}