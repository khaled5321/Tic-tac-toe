import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, onDisconnect, onValue, update, remove } from "firebase/database";
import { v4 as uuidv4 } from 'uuid';

const firebaseConfig = {
    apiKey: "AIzaSyBmE5Ccjk52L8ZcMLsJVpyFFmEKXFZHy2A",
    authDomain: "tic-tac-toe-multiplayer-efebf.firebaseapp.com",
    databaseURL: "https://tic-tac-toe-multiplayer-efebf-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tic-tac-toe-multiplayer-efebf",
    storageBucket: "tic-tac-toe-multiplayer-efebf.appspot.com",
    messagingSenderId: "300642173930",
    appId: "1:300642173930:web:59f71e7c2e2b0cef5fe893"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const dialogBTN = document.querySelector('.dialog-btn');
const dialogText = document.querySelector('.dialog-text');
const overlay = document.querySelector('.overlay');

const guiBoard = document.getElementById("board");
const afterGame = document.querySelector(".after-game");
const label = document.getElementById("label");

const status = document.querySelector(".status");
const player1_label = document.getElementById("player1");
const turn_label = document.getElementById("turn");
const player2_label = document.getElementById("player2");
const coordinates = {
    start: null,
    end: null,
}
let player1 = null;
let player2 = null;
let currentPlayer = { letter: "X", color: "red" };

let cells = guiBoard.children;
let board = [
    [cells[0], cells[1], cells[2]],
    [cells[3], cells[4], cells[5]],
    [cells[6], cells[7], cells[8]],
];

let game0ver=false;
let hasRoom = false;
let playerID, playerRef, roomRef;
let p1 = { letter: "X", color: "red" };
let p2 = { letter: "O", color: "blue" };

function connection(roomRef) {
    onValue(roomRef, (snapshot) => {
        let room = snapshot.val() || null;
        if (room) {
            let playerone = room.playerOne;
            let playertwo = room.playerTwo;
            let move = room.move || null;
            let currentplayer=room.currentplayer;

            if (playerone && playertwo !== "null") {
                overlay.classList.add('hidden');
                status.classList.remove('hidden');

                if (move) {
                    applyMove(move,currentplayer);
                }
            }
        }
        else {
            if(!game0ver){
                overlay.classList.remove('hidden');
                dialogText.textContent = "Opponent Disconnected!";
                dialogBTN.textContent = "OK";
            }
        }
    });
}

function createRoom(playerID) {
    let roomID= uuidv4();
    let roomRef = ref(database, `rooms/${roomID}`);
    set(roomRef, {
        playerOne: playerID,
        playerTwo: "null",
        move: null,
        currentplayer:{ letter: "X", color: "red" },
    });

    return roomRef;
}

function matchMaking(playerID) {
    let allroomsRef = ref(database, "rooms");

    onValue(allroomsRef, (snapshot) => {
        let rooms = snapshot.val();
        if (!hasRoom) {
            if (rooms) {
                
                for (let [key, value] of Object.entries(rooms)) {
                    let playertwo = value.playerTwo
                    if (playertwo === "null") {
                        roomRef = ref(database, `rooms/${key}`);
                        hasRoom = true;
                        update(roomRef, { playerTwo: playerID });
                        connection(roomRef);
                        setPlayers(p2, p1);
                        break;
                    }
                }
                if (!hasRoom) {
                    hasRoom = true;
                    roomRef = createRoom(playerID);
                    connection(roomRef);
                    setPlayers(p1, p2);
                }
            }
            else {
                hasRoom = true;
                roomRef = createRoom(playerID);
                connection(roomRef);
                setPlayers(p1, p2);
            }

            //remove room if player disconnects
            onDisconnect(roomRef).remove();
        }
    })
}


// Sets the players
function setPlayers(p1, p2) {
    player1 = p1;
    player2 = p2;
    player1_label.innerText=`You: ${player1.letter}`;
    player1_label.style.color=player1.color;

    turn_label.innerText=`Turn: ${currentPlayer.letter}`;
    turn_label.style.color=currentPlayer.color;

    player2_label.innerText=`Opponent: ${player2.letter}`;
    player2_label.style.color=player2.color;
}

// display the move from firebase on the UI
function applyMove(cellIndex,currentplayer) {
    let cell = board[cellIndex[0]][cellIndex[1]];
    currentPlayer=currentplayer;
    makeMove(cell);
    currentPlayer.letter = (currentPlayer.letter === player1.letter) ? (player2.letter) : (player1.letter);
    currentPlayer.color = (currentPlayer.color === player1.color) ? (player2.color) : (player1.color);

    turn_label.innerText=`Turn: ${currentPlayer.letter}`;
    turn_label.style.color=currentPlayer.color;
}

// write move to firebase database
function updateMove(move){
    update(roomRef, { move: move, currentplayer:currentPlayer });
}

// add Click events to cells
function addEvent(cells) {
    for (let cell of cells) {
        cell.addEventListener('click', () => {
            if (currentPlayer.letter !== player1.letter) return;
            makeMove(cell);
        })
    }
}

function makeMove(cell) {
    if (cell.dataset.clicked === "true") return; // cell already clicked before
    
    cell.setAttribute("data-clicked", "true");
    cell.innerText = currentPlayer.letter;
    cell.style.color = currentPlayer.color;
    checkForWin();
    updateMove(getIndexOfCell(cell)); //send move to firebase database
}

// utility function to check if 3 cells content is equal
function isEqual(a, b, c) {
    let equal = (a.innerText === b.innerText) && (b.innerText === c.innerText) && (a.innerText !== "");
    if (equal) {
        coordinates.start = a;
        coordinates.end = c;
    }
    return equal;
}

// gets the index of the cell in board array
function getIndexOfCell(cell) {
    for (var i = 0; i < board.length; i++) {
        var index = board[i].indexOf(cell);
        if (index > -1) {
            return [i, index];
        }
    }
}

function checkForWin() {
    //check rows
    if (isEqual(board[0][0], board[0][1], board[0][2]) ||
        isEqual(board[1][0], board[1][1], board[1][2]) ||
        isEqual(board[2][0], board[2][1], board[2][2])) {
        drawLine("row", currentPlayer.color);
        gameEnded();
    }
    //check cols
    else if (isEqual(board[0][0], board[1][0], board[2][0]) ||
        isEqual(board[0][1], board[1][1], board[2][1]) ||
        isEqual(board[0][2], board[1][2], board[2][2])) {
        drawLine("col", currentPlayer.color)
        gameEnded();
    }
    //check left diagnol 
    else if (isEqual(board[0][0], board[1][1], board[2][2])) {
        drawLine("diagnolleft", currentPlayer.color);
        gameEnded();
    }
    //check right diagonal
    else if (isEqual(board[0][2], board[1][1], board[2][0])) {
        drawLine("diagnolright", currentPlayer.color);
        gameEnded();
    }
    // if no one won check for empty cell, if none then it's a draw
    else {
        for (let row of board) {
            for (let cell of row) {
                if (cell.innerText === "") {
                    return null
                }
            }
        }
        gameEnded(true);        
    }
}

// draw winning line after game ends
function drawLine(mode, color) {
    let main = document.querySelector("#main");
    let parent = {
        xleft: guiBoard.getBoundingClientRect().left,
        ytop: guiBoard.getBoundingClientRect().top,
        xright: guiBoard.getBoundingClientRect().right,
        ybottom: guiBoard.getBoundingClientRect().bottom,
    }
    let start = {
        xleft: coordinates.start.getBoundingClientRect().left - parent.xleft,
        ytop: coordinates.start.getBoundingClientRect().top - parent.ytop,
        xright: coordinates.start.getBoundingClientRect().right - parent.xleft,
        ybottom: coordinates.start.getBoundingClientRect().bottom - parent.ytop,
    };
    let end = {
        xleft: coordinates.end.getBoundingClientRect().left - parent.xleft,
        ytop: coordinates.end.getBoundingClientRect().top - parent.ytop,
        xright: coordinates.end.getBoundingClientRect().right - parent.xleft,
        ybottom: coordinates.end.getBoundingClientRect().bottom - parent.ytop,
    };

    const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    const line = document.createElementNS("http://www.w3.org/2000/svg", 'line');

    line.setAttribute("stroke", color);
    line.setAttribute("fill", color);
    line.setAttribute("style", "stroke-width:4");

    if (mode === "diagnolleft") {
        line.setAttribute("x1", start.xleft);
        line.setAttribute("y1", start.ytop + 15);
        line.setAttribute("x2", (end.xright));
        line.setAttribute("y2", (end.ybottom + 15));
    }
    if (mode === "diagnolright") {
        line.setAttribute("x1", start.xright + 5);
        line.setAttribute("y1", start.ytop + 15);
        line.setAttribute("x2", (end.xleft + 5));
        line.setAttribute("y2", (end.ybottom + 5));
    }
    if (mode === "row") {
        let half = (start.ybottom - start.ytop) / 2
        line.setAttribute("x1", start.xleft);
        line.setAttribute("y1", (start.ytop + half + 15));
        line.setAttribute("x2", (end.xright));
        line.setAttribute("y2", (end.ytop + half + 15));
    }
    if (mode === "col") {
        let half = (start.xright - start.xleft) / 2
        line.setAttribute("x1", (start.xleft + half));
        line.setAttribute("y1", (start.ytop + 15));
        line.setAttribute("x2", (end.xleft + half));
        line.setAttribute("y2", (end.ybottom + 15));
    }
    svg.appendChild(line);
    main.insertBefore(svg, main.children[0]);
}

// call after game ends, displays the winner and play again button.
function gameEnded(draw=false) {
    game0ver=true;
    guiBoard.style.pointerEvents = "none";
    status.style.display="none";
    afterGame.classList.remove('hidden');

    if(draw){
        label.style.color = "black";
        label.innerText = "Draw!";
    }
    else{
        label.style.color = currentPlayer.color;
        label.innerText = `${currentPlayer.letter} wins!`;
    }

    setTimeout(function() {
        remove(roomRef);
        roomRef=null;
    }, 1000); 
}

// when the user login or logout
onAuthStateChanged(auth, (user) => {
    if (user) {
        playerID = user.uid;
        playerRef = ref(database, `players/${playerID}`);
        set(playerRef, {
            id: playerID,
            name: "Anonymous"
        });
        onDisconnect(playerRef).remove();
        matchMaking(playerID);

    } 
});

signInAnonymously(auth)
    .catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage + "refreshPage!");
    });

addEvent(cells);