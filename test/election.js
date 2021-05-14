const Election = artifacts.require('./Election.sol');

contract('Election', (accounts) => {
  it('inicializa sem eleitores cadastrados', async () => {
    const election = await Election.deployed();
    const voters = await election.getVoters.call();
    assert.equal(voters.length, 0, 'O contrato possui 0 eleitores');
  });

  it('inicializa sem votos cadastrados', async () => {
    const election = await Election.deployed();
    const votes = await election.getVotes.call();
    assert.equal(votes.length, 0, 'O contrato possui 0 votos');
  });

  it('inicializa com a quantidade correta de candidatos', async () => {
    const election = await Election.deployed();
    const candidates = await election.getCandidates.call();
    assert.equal(candidates.length, 2, 'O contrato possui 2 candidatos');
  });

  it('candidatos iniciam com 0 votos', async () => {
    const election = await Election.deployed();
    const candidates = await election.getCandidates.call();
    assert.equal(candidates[0].votes, 0, 'O candidato 1 possui 0 votos');
    assert.equal(candidates[1].votes, 0, 'O candidato 2 possui 0 votos');
  });

  it('administrador e atribuido corretamente', async () => {
    const election = await Election.deployed();
    const admin = await election.admin.call();
    assert.equal(admin, accounts[0], 'O administrador e o criador do contrato');
  });

  it('eleitor pode pedir permissao para votar', async () => {
    const election = await Election.deployed();
    await election.requestVoteCapability({
      from: accounts[1],
    });
    const voters = await election.getVoters.call();
    assert.equal(voters.length, 1, 'Eleitor adicionado a lista de eleitores');
    assert.equal(
      voters[0].canVote,
      false,
      'Eleitor ainda nao tem permissao de voto'
    );
    assert.equal(voters[0].voted, false, 'Eleitor ainda votou');
  });

  it('administrador pode conceder permissao de voto aos eleitores', async () => {
    const election = await Election.deployed();
    await election.giveVoteCapability(accounts[1], {
      from: accounts[0],
    });
    const newVoters = await election.getVoters.call();
    assert.equal(
      newVoters[0].canVote,
      true,
      'Eleitor possui permissao de voto'
    );
    assert.equal(newVoters[0].voted, false, 'Eleitor ainda votou');
  });

  it('somente o administrador pode conceder permissao de voto aos eleitores', async () => {
    const election = await Election.deployed();
    await election.requestVoteCapability({
      from: accounts[2],
    });

    try {
      await election.giveVoteCapability(accounts[2], {
        from: accounts[1],
      });
    } catch (error) {
      assert(
        error.message.includes('Somente o admin pode dar a capacidade de votar')
      );
    }

    const voters = await election.getVoters.call();
    assert.equal(
      voters[1].canVote,
      false,
      'Eleitor ainda nao tem permissao de voto'
    );
  });

  it('eleitor nao pode votar sem permissao', async () => {
    const election = await Election.deployed();
    try {
      await election.vote(1, {
        from: accounts[2],
      });
    } catch (error) {
      assert(
        error.message.includes('Eleitor nao possui a capacidade de votar')
      );
    }
    const votes = await election.getVotes.call();
    assert.equal(votes.length, 0, 'O contrato ainda possui 0 votos');
  });

  it('eleitor pode votar com permissao', async () => {
    const election = await Election.deployed();
    await election.vote(1, {
      from: accounts[1],
    });
    const votes = await election.getVotes.call();
    const voters = await election.getVoters.call();
    assert.equal(voters[0].voted, true, 'O eleitor votou com sucesso');
    assert.equal(votes.length, 1, 'O voto foi computado');
  });

  it('os votos sao computados para o candidato correto', async () => {
    const election = await Election.deployed();
    await election.requestVoteCapability({
      from: accounts[4],
    });

    await election.giveVoteCapability(accounts[4], {
      from: accounts[0],
    });

    const previousVotes = await election.getCandidates.call();
    assert.equal(previousVotes[1].id, 2, 'O candidato possui o id correto');
    assert.equal(previousVotes[1].votes, 0, 'O candidato possui 0 voto');

    await election.vote(2, {
      from: accounts[4],
    });
    const candidates = await election.getCandidates.call();
    assert.equal(candidates[1].id, 2, 'O candidato possui o id correto');
    assert.equal(candidates[1].votes, 1, 'O candidato possui 1 voto');
  });

  it('eleitor nao pode votar mais de uma vez', async () => {
    const election = await Election.deployed();

    const previousVotes = await election.getVotes.call();

    try {
      await election.vote(1, {
        from: accounts[1],
      });
    } catch (error) {
      assert(error.message.includes('Eleitor ja realizou o seu voto'));
    }
    const votes = await election.getVotes.call();
    assert.equal(
      votes.length,
      previousVotes.length,
      'O contrato ainda possui a mesma quantidade de votos'
    );
  });

  it('eleitor nao pode votar em candidato nao existente na eleicao', async () => {
    const election = await Election.deployed();

    await election.requestVoteCapability({
      from: accounts[5],
    });

    await election.giveVoteCapability(accounts[5], {
      from: accounts[0],
    });

    const previousVotes = await election.getVotes.call();

    try {
      await election.vote(3, {
        from: accounts[5],
      });
    } catch (error) {
      assert(error.message.includes('Candidato nao encontrado'));
    }
    const votes = await election.getVotes.call();
    assert.equal(
      votes.length,
      previousVotes.length,
      'O contrato ainda possui a mesma quantidade de votos'
    );
  });
});
