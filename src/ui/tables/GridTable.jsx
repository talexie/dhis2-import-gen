import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar} from '@mui/x-data-grid';

export const GridTable = ( props )=> {
  const { 
    config,
    actionsAllowed,
    columns=[],
    loading, 
    data=[],
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
    generateId,
    ...rest 
  } = props;
  const initialPageSize = pageSize?pageSize:25;
  const options = {
    exportButton: exportButton?exportButton:true,
    exportAllData: true,
    filtering: filtering?filtering:true ,
    pageSize: initialPageSize,
    search: search?search:true,
    grouping: grouping?grouping:false,
    selection: selection?selection:false,
    pageSizeOptions: [10,25,50,100,250,500,1000,5000,10000,50000],
    draggable: draggable?draggable: true,

  };
  return (
    <Box sx={{ height:'450px', width: '100%',mt:1 }}>
        <DataGrid
            label= { title }
            loading = { loading }
            columns={ columns }
            rows={ data }
            rowsPerPageOptions ={ options.pageSizeOptions}
            disableToolbarButton = { false }
            components={{ Toolbar: GridToolbar }}
            getRowId = { (row)=>row?.id??row?.[generateId]}
        />
    </Box>
  );
}
export default GridTable;
