import React from 'react';
import { css } from '@emotion/react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const classes={
  table:  css({
    minWidth: 650,
  }),
  root:  css({
    marginBottom: '32px',
  }),
};

export const TableList = (props) => {
    const { rows, title } = props;

  return (
    <TableContainer component={Paper} css={classes.root}>
      <Table css={classes.table} aria-label={ title }>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell align="right">Name</TableCell>
            <TableCell align="right">Type</TableCell>
            <TableCell align="right">Active</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            rows.length === 0?
            (
                <TableRow key={'no-data'}>
                    <TableCell align="right">No data </TableCell>
                </TableRow>
            ):
            (
                rows?.map((row,i) => (
                    <TableRow key={i}>
                    <TableCell component="th" scope="row">
                        {row?.id}
                    </TableCell>
                    <TableCell align="right">{row?.name}</TableCell>
                    <TableCell align="right">{row?.type}</TableCell>
                    <TableCell align="right">{row?.active}</TableCell>
                    </TableRow>
                ))
            )
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}
