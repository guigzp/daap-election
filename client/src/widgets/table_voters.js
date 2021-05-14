import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const useStyles = makeStyles({
  table: {
    minWidth: 700,
  },
});

export default function TableVoters(props) {
  const classes = useStyles();

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label='customized table'>
        <TableHead>
          <TableRow>
            <StyledTableCell>ENDEREÇO</StyledTableCell>
            <StyledTableCell align='right'>PODE VOTAR</StyledTableCell>
            <StyledTableCell align='right'>JÁ VOTOU</StyledTableCell>
            <StyledTableCell align='right'>PERMITIR VOTO</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.rows.map((row) => (
            <StyledTableRow key={row.public_address}>
              <StyledTableCell component='th' scope='row'>
                {row.public_address}
              </StyledTableCell>
              <StyledTableCell align='right'>
                {row.canVote ? 'Sim' : 'Não'}
              </StyledTableCell>
              <StyledTableCell align='right'>
                {row.voted ? 'Sim' : 'Não'}
              </StyledTableCell>
              <StyledTableCell align='right'>
                <Button
                  variant='contained'
                  disabled={row.canVote}
                  onClick={() => {
                    props.grantAbilityToVote(row.public_address);
                  }}
                >
                  CONFIRMAR
                </Button>
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
