# Manage Data for DATIM
 - DHIS2 WebApp for mapping DHIS2 data to DATIM via Indicator and Location Mapping
## Features
 - Supports different reports
 - Different periods
 - Listing for Location and Indicator mappings
 - Location via Organisation Unit Tree or Groups

## Development
 - To get started
    `yarn install` or `npm install`
 - To build the app
    `yarn build` or `npm run build`
 - Deploy to DHIS2
  Upload the zip file to DHIS2

## How to Configure SMARTCARE Data Submission
   1. Create organisation Group with the code *`SMARTCARE_LEGACY`*. 
   Add all organisation Units which use legacy smartcare to this group.

   2. Create a user group with the code *`ZM_SMARTCARE_ADMIN`*. 
   Add all users who need to access more periods other than the latest reporting period. For example, if current month is February 2023, the latest reporting month is January, 2023. Without this user group, you can not see other reporting months e.g December, 2022 for a given reporting type e.g Monthly or Quarterly, etc.

   3. Create a user group with the code *`MANAGE_DATIM_ADMIN`*. 
   Add all users who need to  have access to the Manage Data for DATIM export modules, mappings and Smartcare upload. By default, any user who belongs to user group *`ZM_CORE_TEAM`* will have access to all Manage Data for DATIM app modules.
