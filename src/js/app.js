App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  gasPrice: 0,
  etherBalance:0,
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event);
        if(event)
        {
          $("#transaction_hash").html(event.transactionHash);
          $("#block_number").html(event.blockNumber);
          $("#block_hash").html(event.blockHash);
          
        }else
        {
           $("#transaction_panel").hide();
          
        }
        // Reload when a new vote is recorded
        
      });

    });
  },

  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();
    App.runTimer();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
        $("#account").html(account);
        //Get Balance
        web3.eth.getBalance(App.account,function(err, balance) {
          if (err === null) {
            App.etherBalance = balance;
            $("#balance").html(web3.fromWei(balance.toNumber(),'ether'));
          }
        });
      }
    });

    
    //Get Gas Price

    web3.eth.getGasPrice(function(err, price) {
      if (err === null) {
        App.etherBalance = price;
        $("#gasPrice").html(web3.fromWei(price.toNumber(),'ether'));
      }
    });

    App.loadContractsData();
    
  },
// Load contract data
  loadContractsData: function(){

    var loader = $("#loader");
    var content = $("#content");
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();


      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);

          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('#voting_panel').hide();
        $('#add_candidate_panel').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  castVote: function() {
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
      location.reload();
    }).catch(function(err) {
      console.error(err);
    });
  },

  addCandidate: function() {
    var c_name = $('#c_name').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.addCandidate(c_name,{ from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
      location.reload();
    }).catch(function(err) {
      console.error(err);
    });
  },

  //CountDown Javascript 
  runTimer: function()
  {
        // Set the date we're counting down to
      var countDownDate = new Date('Jul 10, 2020');

      // Update the count down every 1 second
      var x = setInterval(function() {

      // Get today's date and time
      var now = new Date().getTime();

      // Find the distance between now and the count down date
      var distance = countDownDate - now;

      // Time calculations for days, hours, minutes and seconds
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Display the result in the element with id="demo"
      document.getElementById("time_remaing").innerHTML = days + "d " + hours + "h "
      + minutes + "m " + seconds + "s ";

      // If the count down is finished, write some text
      if (distance < 0) {
        clearInterval(x);
        document.getElementById("time_remaing").innerHTML = "EXPIRED";
      }
    }, 1000);
  }


};

$(function() {
  $(window).load(function() {
    App.init();
  });
});