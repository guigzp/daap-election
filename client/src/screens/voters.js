import React from 'react';
import ElectionContract from '../contracts/Election.json';
import getWeb3 from '../getWeb3';
import Typography from '@material-ui/core/Typography';
import TableVoters from '../widgets/table_voters';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';

import { makeStyles } from '@material-ui/core/styles';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';

export default class Voters extends React.Component {
  state = { web3: null, voters: null, contract: null };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = ElectionContract.networks[networkId];

      const account = await web3.eth.getCoinbase();

      const instance = new web3.eth.Contract(
        ElectionContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      this.setState(
        { web3, contract: instance, account: account },
        this.getVoters
      );
    } catch (error) {
      console.error(error);
    }
  };

  getVoters = async () => {
    const { contract } = this.state;

    const voters = await contract.methods.getVoters.call().call();

    this.setState({ votersCount: voters.length, voters: voters });
  };

  grantAbilityToVote = async (address) => {
    const { contract, account } = this.state;

    await contract.methods.giveVoteCapability(address).send({
      from: account,
    });
  };

  render() {
    if (!this.state.web3 || this.state.voters === null) {
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
            votersCount={this.state.votersCount}
            voters={this.state.voters}
            ability={this.grantAbilityToVote}
          ></TableCard>
        </Grid>
      </Grid>
    );

    return (
      <div>
        <Typography>
          Quantidade de eleitores registrados: {this.state.votersCount}
        </Typography>
        <TableVoters
          rows={this.state.voters}
          grantAbilityToVote={this.grantAbilityToVote}
        />
      </div>
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
          <Typography>
            Quantidade de eleitores registrados: {props.votersCount}
          </Typography>
          <TableVoters rows={props.voters} grantAbilityToVote={props.ability} />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
