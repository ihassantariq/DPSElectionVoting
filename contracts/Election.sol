pragma solidity ^0.5.0;

//Election for some candidate
contract Election {

    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Store Candidates
    // Fetch Candidate
    mapping(uint => Candidate) public candidates;
    // Store Candidates Count
    uint public candidatesCount;

    // voted event
    event votedEvent (
        uint indexed _candidateId
    );
     // voted event
    event candidateAdded (
        uint indexed _candidateId
    );

    constructor () public {
        privatelyAddCandidate("Hassan Tariq");
        privatelyAddCandidate("Hasna Elhilali");
    }

    function privatelyAddCandidate (string memory _name) private  {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function addCandidate (string memory _name) public  {
        // require that they haven't voted before
        require(!voters[msg.sender]);


        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        // trigger voted event
        emit candidateAdded(candidatesCount);
    }

    function vote (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount ++;

        // trigger voted event
        emit votedEvent(_candidateId);
    }
}
