import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  root: {
    marginBottom: '32px',
  },
});

export const TableList = (props) => {
    const { rows, title } = props;
  const classes = useStyles();

  return (
    <TableContainer component={Paper} className={classes.root}>
      <Table className={classes.table} aria-label={ title }>
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
