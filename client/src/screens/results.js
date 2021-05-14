import React from 'react';
import ElectionContract from '../contracts/Election.json';
import getWeb3 from '../getWeb3';
import Typography from '@material-ui/core/Typography';
import TableVotes from '../widgets/table_votes';
import TableResults from '../widgets/table_results';
import Paper from '@material-ui/core/Paper';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';

import { makeStyles } from '@material-ui/core/styles';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';

export default class Results extends React.Component {
  state = {
    web3: null,
    voteCount: 0,
    votes: [],
    candidates: [],
    contract: null,
  };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = ElectionContract.networks[networkId];
      const instance = new web3.eth.Contract(
        ElectionContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      this.setState({ web3, contract: instance }, this.getVotes);
    } catch (error) {
      console.error(error);
    }
  };

  getVotes = async () => {
    const { contract } = this.state;

    const votes = await contract.methods.getVotes.call().call();

    const candidates = await contract.methods.getCandidates.call().call();

    this.setState({
      voteCount: votes.length,
      votes: votes,
      candidates: candidates,
    });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <Grid
        container
        spacing={0}
        direction='column'
        alignItems='center'
        justify='center'
        style={{ minHeight: '100vh' }}
      >
        <Grid item xs={12}>
          <TableCard
            voteCount={this.state.voteCount}
            candidates={this.state.candidates}
            votes={this.state.votes}
          ></TableCard>
        </Grid>
      </Grid>
    );
  }
}

const useStyles = makeStyles({
  root: {},
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9,
    marginTop: '30',
  },
});

function TableCard(props) {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <CardContent>
          <Typography>Quantidade de votos: {props.voteCount}</Typography>
          <TableResults rows={props.candidates} />
          <br></br>
          <br></br>
          <TableVotes rows={props.votes} />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
