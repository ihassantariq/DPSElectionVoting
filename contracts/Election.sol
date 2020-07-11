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


    //Showing messages 
    mapping(uint => string) public messages;

    // Store Candidates Count
    uint public candidatesCount;

    // Store Candidates Count
    uint public messagesCount;

    // voted event
    event votedEvent (
        uint indexed _candidateId
    );
    
    // voted event
    event candidateAdded (
        uint indexed _candidateCount
    );

     // voted event
    event messageAdded (
        uint indexed _messageCount
    );

    constructor () public {
        
        privatelyAddCandidate("Hassan Tariq");
        privatelyAddCandidate("Hasna Elhilali");
        addMessage("Message # 1");
        addMessage("Message # 2");
    }

    //function for adding message
    function addMessage(string memory _message) public {
        messagesCount ++;
        messages[messagesCount] = _message;
        emit messageAdded(messagesCount);
    }

    //Adding candidate privately 
    function privatelyAddCandidate (string memory _name) private  {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    //Adding others add candidate
    function addCandidate (string memory _name) public  {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        // trigger voted event
        emit candidateAdded(candidatesCount);
    }

    //For for particular candidate
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
