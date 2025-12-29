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
    uint256 public nextgameId;
    uint256 public totalVolume;

    event GameCreated(uint256 indexed gameId, address indexed player1);
    event GameJoined(
        uint256 indexed gameId,
        address indexed player1,
        address indexed player2
    );
    event MoveMade(
        uint256 indexed gameId,
        address indexed player,
        uint256 x,
        uint256 y,
        address nextPlayer
    );
    event GameFinished(
        uint256 indexed gameId,
        address indexed winner,
        bool isDraw
    );

    receive() external payable {}

    constructor() {}

    function createGame() external payable {
        require(msg.value == DEPOSIT_AMOUNT, "Must send exactly 0.1 ETH");
        totalVolume += msg.value;

        Game memory newGame;
        newGame.player1 = msg.sender;
        newGame.id = nextgameId++;
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

    function joinGame(uint256 gameId) external payable {
        uint256 idx = getGameById(gameId);
        Game storage cur = games[idx];

        require(cur.player1 != msg.sender, "You cannot join your own game");
        require(cur.player2 == address(0), "Game already has two players");

        require(msg.value == DEPOSIT_AMOUNT, "Must send exactly 0.1 ETH");
        totalVolume += msg.value;

        cur.player2 = msg.sender;

        emit GameJoined(cur.id, cur.player1, msg.sender);
    }

    function makeMove(uint gameId, uint x, uint y) external {
        require(
            x >= 0 && x < FILED_SIZE && y >= 0 && y < FILED_SIZE,
            "Invalid field"
        );

        Game storage cur = games[getGameById(gameId)];

        require(cur.currentPlayer == msg.sender, "Not your turn");
        require(cur.isFinished == false, "The game is already over");
        require(cur.board[x][y] == FieldStatus.Unset, "Field already set");

        FieldStatus curFiledStatus = cur.player1 == msg.sender
            ? FieldStatus.Player1
            : FieldStatus.Player2;
        cur.board[x][y] = curFiledStatus;
        cur.moves++;

        //This is when all move are made
        if (cur.moves == FILED_SIZE * FILED_SIZE) {
            cur.isFinished = true;
            uint256 amount = 0.1 ether;
            require(
                address(this).balance >= amount * 2,
                "Not enough balance on the contract"
            );

            (bool sentToPl1, ) = cur.player1.call{value: amount}("");
            require(sentToPl1, "Failed to send ETH");

            (bool sentToPl2, ) = cur.player2.call{value: amount}("");
            require(sentToPl2, "Failed to send ETH");

            emit GameFinished(gameId, msg.sender, true);
        }

        // Match For A win with just one for loop
        bool rowMatch = true;
        bool colMatch = true;
        bool digMatch = true;
        bool invDigMatch = true;

        for (uint i = 0; i < FILED_SIZE; ++i) {
            if (cur.board[x][i] != curFiledStatus) {
                rowMatch = false;
            }

            if (cur.board[i][y] != curFiledStatus) {
                colMatch = false;
            }

            if (cur.board[i][i] != curFiledStatus) {
                digMatch = false;
            }

            if (cur.board[i][FILED_SIZE - 1 - i] != curFiledStatus) {
                invDigMatch = false;
            }
        }

        if (rowMatch || colMatch || digMatch || invDigMatch) {
            won(gameId);
            return;
        }

        cur.currentPlayer = curFiledStatus == FieldStatus.Player1
            ? cur.player2
            : cur.player1;

        emit MoveMade(gameId, msg.sender, x, y, cur.currentPlayer);
    }

    function won(uint256 gameId) internal {
        Game storage cur = games[gameId];
        cur.isFinished = true;

        uint256 amount = DEPOSIT_AMOUNT * 2;
        require(
            address(this).balance >= amount,
            "Not enough balance on the contract"
        );
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send ETH");
        totalVolume -= amount;

        emit GameFinished(gameId, msg.sender, false);
    }

    function getGameById(uint256 gameId) internal view returns (uint256) {
        for (uint256 i = 0; i < games.length; ++i) {
            if (games[i].id == gameId) {
                return i;
            }
        }
        revert("Game not found");
    }

    function getActiveGamesForSender() external view returns (Game[] memory) {
        uint count = 0;

        // 1. Count matching games
        for (uint i = 0; i < games.length; i++) {
            // MATCHING LOGIC HERE
            if (
                (games[i].player1 == msg.sender ||
                    games[i].player2 == msg.sender) &&
                !games[i].isFinished &&
                games[i].player2 != address(0)
            ) {
                count++;
            }
        }

        Game[] memory activeGames = new Game[](count);
        uint index = 0;

        // 2. Fill the array
        for (uint i = 0; i < games.length; i++) {
            // LOGIC MUST BE IDENTICAL TO LOOP 1
            if (
                (games[i].player1 == msg.sender ||
                    games[i].player2 == msg.sender) &&
                !games[i].isFinished &&
                games[i].player2 != address(0)
            ) {
                activeGames[index] = games[i];
                index++;
            }
        }

        return activeGames;
    }

    function getGame(
        uint256 gameId
    ) external view returns (FieldStatus[FILED_SIZE][FILED_SIZE] memory) {
        return games[gameId].board;
    }

    function getCurrentPlayer(uint256 gameId) external view returns (address) {
        return games[gameId].currentPlayer;
    }

    function getOpenGames() external view returns (Game[] memory) {
        uint256 openCount = 0;

        // First pass: count open games
        for (uint i = 0; i < games.length; i++) {
            if (games[i].player2 == address(0)) {
                openCount++;
            }
        }

        // Second pass: populate array
        Game[] memory openGames = new Game[](openCount);
        uint256 index = 0;

        for (uint i = 0; i < games.length; i++) {
            if (games[i].player2 == address(0)) {
                openGames[index] = games[i];
                index++;
            }
        }

        return openGames;
    }
}
