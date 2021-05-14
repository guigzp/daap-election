// SPDX-License-Identifier: MIT

pragma solidity >=0.5.16;
pragma experimental ABIEncoderV2;

contract Election {

    struct Voter{
        address public_address;
        bool voted;
        bool canVote;
    }

    struct Candidate {
        uint id;
        string name;
        uint votes;
    }

    struct Vote {
        address voter;  
        uint candidate;
        string candidateName;
    }   

    mapping(address => Voter) public voters;
    mapping(uint => Candidate) public candidates;

    uint public votersCount;
    uint public candidatesCount;
    uint public votesCount;

    address[] public votersKeys;

    Vote[] public votes;

    address public admin;

    event votedEvent (
        uint indexed candidate
    );

     event requestedPermissionEvent ();

     event grantedPermissionEvent (
         address _granted
     );

    function addCandidate (string  memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    constructor() public {
        admin = msg.sender;
        addCandidate("Taylor Swift");
        addCandidate("Lana del Rey");
    }

  

    function requestVoteCapability() public {
        require(!voters[msg.sender].voted);
        require(!voters[msg.sender].canVote);
        require(voters[msg.sender].public_address != msg.sender);

        voters[msg.sender] = Voter(msg.sender, false, false);
        votersKeys.push(msg.sender);
        votersCount ++;
    
        emit requestedPermissionEvent();
    }

    
    function giveVoteCapability(address voter) public {
        require(!voters[voter].voted, "Eleitor ja realizou o seu voto!");
        require(!voters[voter].canVote, "Eleitor ja possui a capacidade de votar!");
        require(msg.sender == admin, "Somente o admin pode dar a capacidade de votar!");

        voters[voter].canVote = true;

        emit grantedPermissionEvent(voter);
    }

    function vote (uint  candidate) public {
        require(!voters[msg.sender].voted, "Eleitor ja realizou o seu voto!");
        require(voters[msg.sender].canVote, "Eleitor nao possui a capacidade de votar!");
        require(candidate > 0 && candidate <= candidatesCount, "Candidato nao encontrado!");

        voters[msg.sender].voted = true;
        candidates[candidate].votes ++;

        votes.push(Vote(msg.sender, candidate, candidates[candidate].name));

        emit votedEvent(candidate);
    }

    function getVotes() public view  returns(Vote[] memory){
        uint  totalVotes = votes.length;
        Vote[] memory votesAux = new Vote[](totalVotes);
        for(uint i = 0; i< totalVotes; i++){
            votesAux[i] = votes[i];
        }
        return votesAux;
    }

    function getVoters() public view returns(Voter[] memory){
        Voter[] memory votersAux = new Voter[](votersCount);
          for(uint i = 0; i < votersCount; i++){
            votersAux[i] = voters[votersKeys[i]];
        }
        return votersAux;
    }

    function getCandidates() public view returns(Candidate[] memory){
        Candidate[] memory candidatesAux = new Candidate[](candidatesCount);
          for(uint i = 0; i< candidatesCount; i++){
            candidatesAux[i] = candidates[i+1];
        }
        return candidatesAux;
    }
}
