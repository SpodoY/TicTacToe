// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract TicTacToe {

    uint8 public constant FILED_SIZE = 5;
    uint256 public constant DEPOSIT_AMOUNT = 0.1 ether;

    enum FieldStatus {
        Unset,
        Player1,
        Player2
    }

    struct Game {
        address player1;
        address player2;
        uint256 id;
        FieldStatus[FILED_SIZE][FILED_SIZE] board;
        address currentPlayer;
        bool isFinished;
        uint256 moves;
    }

    Game[] public games;
    uint256 public nextGameId;
    uint256 public totalVolume;

    event GameCreated(uint256 gameId, address player1);
    event GameJoined(uint256 gameId, address player2);
    event MoveMade(uint256 gameId, address player, uint256 x, uint256 y);

    receive() external payable {}

    constructor() {}

    function createGame() external payable  {

        require(msg.value == DEPOSIT_AMOUNT, "Must send exactly 0.1 ETH");
        totalVolume += msg.value;

        Game memory newGame;
        newGame.player1 = msg.sender;
        newGame.id = nextGameId++;
        newGame.currentPlayer = msg.sender;
        newGame.isFinished = false;
        for (uint i = 0; i < FILED_SIZE; i++) {
            for (uint j = 0; j < FILED_SIZE; j++) {
                newGame.board[i][j] = FieldStatus.Unset;
            }
        }

        games.push(newGame);
        emit GameCreated(newGame.id, msg.sender);
    }

    function joinGame(uint256 gameId) external payable  {

        uint256 idx = getGameById(gameId);
        Game storage cur = games[idx];

        require(cur.player1 != msg.sender, "You cannot join your own game");
        require(cur.player2 == address(0), "Game already has two players");

        require(msg.value == DEPOSIT_AMOUNT, "Must send exactly 0.1 ETH");
        totalVolume += msg.value;

        cur.player2 = msg.sender;

        emit GameJoined(cur.id, msg.sender);
    }


    function makeMove(uint gameID, uint x, uint y) external  {
        
        require(x >= 0 && x < FILED_SIZE && y >= 0 && y < FILED_SIZE, "Invalid field");

        Game storage cur = games[getGameById(gameID)];

        require(cur.currentPlayer == msg.sender, "Not your turn");
        require(cur.isFinished == false, "The game is already over");
        require(cur.board[x][y] == FieldStatus.Unset, "Field already set");

        FieldStatus curFiledStatus = cur.player1 == msg.sender ? FieldStatus.Player1 : FieldStatus.Player2;
        cur.board[x][y] = curFiledStatus ;
        cur.moves++;


        //This is when all move are made 
        if (cur.moves == FILED_SIZE * FILED_SIZE) {
            cur.isFinished;
            uint256 amount = 0.1 ether;
            require(address(this).balance > amount * 2, "Not enough balance");
            (bool sentToPl1, ) = cur.player1.call{value: amount}("");
            require(sentToPl1, "Failed to send ETH");
            (bool sentToPl2, ) = cur.player2.call{value: amount}("");
            require(sentToPl2, "Failed to send ETH");
        } 

        // Match For A win with just one for loop
        bool rowMatch  = true;
        bool colMatch  = true;
        bool digMatch  = true;
        bool invDigMatch  = true;

        for (uint i = 0; i < FILED_SIZE; ++i) {
            if(cur.board[x][i] != curFiledStatus){
                rowMatch = false; 
            }

            if(cur.board[i][y] != curFiledStatus){
                colMatch = false; 
            }

            if(cur.board[i][i] != curFiledStatus){
                digMatch = false; 
            }

            if(cur.board[i][FILED_SIZE-1-i] != curFiledStatus){
                invDigMatch = false; 
            }
        }

        if(rowMatch || colMatch || digMatch || invDigMatch){
            won(gameID);
            return;
        }

        cur.currentPlayer = curFiledStatus == FieldStatus.Player1 ? cur.player2 : cur.player1;

    }

    function won(uint256 gameId) internal  {
        Game storage cur = games[gameId];
        cur.isFinished = true;

        uint256 amount = DEPOSIT_AMOUNT *2;
        require(address(this).balance > amount, "Not enough balance");
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send ETH");
        totalVolume -= amount;
    }


    function getGameById(uint256 gameId) internal view returns (uint256) {
        for (uint256 i = 0; i < games.length; ++i) {
            if (games[i].id == gameId) {
                return i;
            }
        }
        revert("Game not found");
    }

    function getGame(uint256 gameId) external view returns (FieldStatus[5][5] memory) {
        return games[gameId].board;
    }
}

