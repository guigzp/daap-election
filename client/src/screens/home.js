import React, { Component } from 'react';
import ElectionContract from '../contracts/Election.json';
import getWeb3 from '../getWeb3';
import '../css/home.css';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';

import { makeStyles } from '@material-ui/core/styles';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

class Home extends Component {
  state = {
    candidates: null,
    web3: null,
    account: null,
    contract: null,
    accountExists: false,
    canVote: false,
    alreadyVoted: false,
    selected: null,
  };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();

      const account = await web3.eth.getCoinbase();

      const networkId = await web3.eth.net.getId();
      const deployedNetwork = ElectionContract.networks[networkId];
      const instance = new web3.eth.Contract(
        ElectionContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      this.setState({ web3, account, contract: instance });
    } catch (error) {

      console.error(error);
    }
    this.getAccountStatus();
  };

  getAccountStatus = async () => {
    const { account, contract } = this.state;

    const myVotingStatus = await contract.methods.voters(account).call();

    const accountExists =
      myVotingStatus.public_address !==
      '0x0000000000000000000000000000000000000000';

    this.setState({
      accountExists: accountExists,
      canVote: myVotingStatus.canVote,
      alreadyVoted: myVotingStatus.voted,
    });

    this.getCandidates();
  };

  getCandidates = async () => {
    const { contract } = this.state;
    const candidates = await contract.methods.getCandidates.call().call();
    this.setState({
      candidates: candidates,
    });
  };

  requestVoteCapability = async () => {
    const { account, contract } = this.state;
    const response = await contract.methods.requestVoteCapability().send({
      from: account,
    });
  };

  vote = async () => {
    if (this.state.selected === null) {
      return;
    }
    console.log(this.state.selected);
    const { account, contract } = this.state;
    await contract.methods.vote(this.state.selected).send({
      from: account,
    });
  };

  handleChange = (event) => {
    console.log(event.target.value);
    this.setState({
      selected: event.target.value,
    });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    if (!this.state.accountExists) {
      return (
        <Grid
          container
          spacing={0}
          direction='column'
          alignItems='center'
          justify='center'
          style={{ minHeight: '100vh' }}
        >
          <Grid item xs={3}>
            <RequestCard buttonClick={this.requestVoteCapability}></RequestCard>
          </Grid>
        </Grid>
      );
    }

    if (!this.state.canVote) {
      return (
        <Grid
          container
          spacing={0}
          direction='column'
          alignItems='center'
          justify='center'
          style={{ minHeight: '100vh' }}
        >
          <Grid item xs={3}>
            <WaitingCard></WaitingCard>
          </Grid>
        </Grid>
      );
    }

    if (this.state.alreadyVoted) {
      return (
        <Grid
          container
          spacing={0}
          direction='column'
          alignItems='center'
          justify='center'
          style={{ minHeight: '100vh' }}
        >
          <Grid item xs={3}>
            <SuccessCard></SuccessCard>
          </Grid>
        </Grid>
      );
    }

    if (this.state.candidates != null) {
      return (
        <Grid
          container
          spacing={0}
          direction='column'
          alignItems='center'
          justify='center'
          style={{ minHeight: '100vh' }}
        >
          <Grid item xs={3}>
            <CandidatesCard
              selected={this.state.selected}
              account={this.state.account}
              handleChange={this.handleChange}
              candidates={this.state.candidates}
              vote={this.vote}
            ></CandidatesCard>
          </Grid>
        </Grid>
      );
    }
    return <div>Carregando...</div>;
  }
}

export default Home;

const useStyles = makeStyles({
  root: {
    maxWidth: 500,
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9,
    marginTop: '30',
  },
});

function RequestCard(props) {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <CardMedia
          className={classes.media}
          image='https://media.istockphoto.com/vectors/exclamation-danger-sign-attention-sign-icon-hazard-warning-attention-vector-id1165337713?k=6&m=1165337713&s=170667a&w=0&h=Vf_lXyBY1iUcYNc1xgl7uvDv_NUUR0SF-t_XRqWbXs4='
          title='Error'
        />
        <CardContent>
          <Typography gutterBottom variant='h5' component='h2'>
            Atenção
          </Typography>
          <p>Conta não registrada para voto!</p>
          <p>É necessário pedir permissão para realizar um voto no sistema.</p>
          <Button
            variant='contained'
            color='primary'
            style={{ justifyContent: 'center' }}
            onClick={props.buttonClick}
          >
            Registrar
          </Button>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function WaitingCard() {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <CardMedia
          className={classes.media}
          image='https://media.istockphoto.com/vectors/exclamation-danger-sign-attention-sign-icon-hazard-warning-attention-vector-id1165337713?k=6&m=1165337713&s=170667a&w=0&h=Vf_lXyBY1iUcYNc1xgl7uvDv_NUUR0SF-t_XRqWbXs4='
          title='Error'
        />
        <CardContent>
          <Typography gutterBottom variant='h5' component='h2'>
            Atenção
          </Typography>
          <Typography>
            Conta já registrada para voto, aguardando confirmação do
            administador!
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function SuccessCard() {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <CardMedia
          className={classes.media}
          image='https://www.freeiconspng.com/thumbs/success-icon/success-icon-10.png'
          title='Error'
        />
        <CardContent>
          <Typography gutterBottom variant='h5' component='h2'>
            Parabéns!
          </Typography>
          <Typography>
            Seu voto já foi computado na eleição! Você pode acompanhar o status
            da eleição na aba Resultados
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function CandidatesCard(props) {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <CardContent>
          <FormControl component='fieldset'>
            <FormLabel component='legend'>Candidatos</FormLabel>
            <RadioGroup value={props.selected} onChange={props.handleChange}>
              {props.candidates.map((candidate) => (
                <FormControlLabel
                  value={candidate.id}
                  control={<Radio />}
                  label={candidate.name}
                />
              ))}
            </RadioGroup>
          </FormControl>
          <br></br>
          <Button variant='contained' color='primary' onClick={props.vote}>
            VOTAR
          </Button>
          <br></br>

          <Typography>Sua conta: {props.account}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
