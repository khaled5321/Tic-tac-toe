import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, onDisconnect, onValue, update } from "firebase/database";

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

                if (move) {
                    applyMove(move,currentplayer);
                }
            }
        }
        else {
            overlay.classList.remove('hidden');
            dialogText.textContent = "Opponent Disconnected!";
            dialogBTN.textContent = "OK";
        }
    });
}

function createRoom(playerID) {
    let roomRef = ref(database, `rooms/${playerID}`);
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
                // eslint-disable-next-line no-unused-vars
                for (let [key, value] of Object.entries(rooms)) {
                    let playertwo = value.playerTwo
                    if (playertwo === "null") {
                        roomRef = ref(database, `rooms/${value.playerOne}`);
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
}

// display the move on the UI (Multiplayer Mode)
function applyMove(cellIndex,currentplayer) {
    let cell = board[cellIndex[0]][cellIndex[1]];
    currentPlayer=currentplayer;
    makeMove(cell);
    currentPlayer.letter = (currentPlayer.letter === player1.letter) ? (player2.letter) : (player1.letter);
    currentPlayer.color = (currentPlayer.color === player1.color) ? (player2.color) : (player1.color);
}

const updateMove = (move) => {
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
    if (cell.dataset.clicked === "true") return;
    
    cell.setAttribute("data-clicked", "true");
    cell.innerText = currentPlayer.letter;
    cell.style.color = currentPlayer.color;
    checkForWin();
    updateMove(getIndexOfCell(cell));
}

function isEqual(a, b, c) {
    let equal = (a.innerText === b.innerText) && (b.innerText === c.innerText) && (a.innerText !== "");
    if (equal) {
        coordinates.start = a;
        coordinates.end = c;
    }
    return equal;
}

function gameEnded() {
    guiBoard.style.pointerEvents = "none";
    afterGame.classList.remove('hidden');
    label.style.color = currentPlayer.color;
    label.innerText = `${currentPlayer.letter} wins!`;
}

function checkForWin() {
    //checkrows
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
    //check diagnol 
    else if (isEqual(board[0][0], board[1][1], board[2][2])) {
        drawLine("diagnolleft", currentPlayer.color);
        gameEnded();
    }
    else if (isEqual(board[0][2], board[1][1], board[2][0])) {
        drawLine("diagnolright", currentPlayer.color);
        gameEnded();
    }
    else {
        for (let row of board) {
            for (let cell of row) {
                if (cell.innerText === "") {
                    return null
                }
            }
        }
        guiBoard.style.pointerEvents = "none";
        afterGame.classList.remove('hidden');
        label.style.color = "black";
        label.innerText = "Draw!";
    }
}

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

// gets the index of the cell in board array
function getIndexOfCell(cell) {
    for (var i = 0; i < board.length; i++) {
        var index = board[i].indexOf(cell);
        if (index > -1) {
            return [i, index];
        }
    }
}

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

    } else {
        console.log("user logged out!");
    }
});

signInAnonymously(auth)
    .then(() => {
        console.log("logged successfully!")
    })
    .catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage + "refreshPage!");
    });

addEvent(cells);