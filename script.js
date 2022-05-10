var mode=localStorage.getItem("mode"); // game mode

const guiBoard=document.getElementById("board");
const playBtn=document.getElementById("playBtn");
const label=document.getElementById("label");
const coordinates={
    start:null,
    end:null,
}
let cells=guiBoard.children;
let board=[
    [cells[0],cells[1],cells[2]],
    [cells[3],cells[4],cells[5]],
    [cells[6],cells[7],cells[8]],
];

let scores={
    X:-100,
    O:100,
    tie:0,
};

let turn=0;
let isOver=false;
let players=[{letter:"X",color:"red"},{letter:"O",color:"blue"}];
let player1=players[0];
let player2=players[1];
let currentPlayer=players[0];

function addEvent(cells){
    for (let cell of cells) {
        cell.addEventListener('click',()=>{
            makeMove(cell);
        })
    }
}

function makeMove(cell){
    if(cell.dataset.clicked==="true") return;

    cell.setAttribute("data-clicked","true");
    cell.innerText=currentPlayer.letter;
    cell.style.color=currentPlayer.color;
    checkForWin();
    turn+=1;
    currentPlayer=(currentPlayer===player1) ? (player2) : (player1);

    if(mode==="AI" && currentPlayer===player2 && isOver===false){
        moveAI();
    }
}

function moveAI(){
    let bestScore=-Infinity;
    let score=0;
    let bestMove;
    let bestPossibleMoves=[board[1][1],board[0][0]];

    // make first move for the AI to boost speed
    if(turn<3){
        for(let cell of bestPossibleMoves){
            if(cell.innerText===""){
                makeMove(cell);
                bestPossibleMoves.splice(bestPossibleMoves.indexOf(cell), 1);
                return;
            }
        }
    }

    for(let row of board){
        for(let cell of row){
            if(cell.innerText===""){
                cell.innerText='O'; //make a move
                score=minimax(0,false); //evaluate the move 
                cell.innerText=""; //undo the move
                if(score > bestScore){ //chose the best move
                    bestScore=score;
                    bestMove=cell;
                }
            }
        }
    }
    makeMove(bestMove);
}

function minimax(depth,isMax){

    let result=checkForWin(true,isMax);
    if(result !==null){
        return scores[result];
    }

    if(isMax){
        let bestScore=-Infinity;
        let score=0;
        for(let row of board){
            for(let cell of row){
                if(cell.innerText===""){
                    cell.innerText='O'; //make a move
                    score=minimax(depth+1,false); //evaluate ai move
                    cell.innerText=""; //undo the move
                    bestScore=Math.max(score, bestScore);
                }
            }
        }
        return bestScore;
    }
    else{
        let minScore=Infinity;
        for(let row of board){
            for(let cell of row){
                if(cell.innerText===""){
                    cell.innerText='X'; //make a move
                    let score=minimax(depth+1,true); //evaluate ai move
                    cell.innerText=""; //undo the move
                    minScore=Math.min(score, minScore);
                }
            }
        }
        return minScore;
    }
}

function isEqual(a,b,c){
    let equal=(a.innerText===b.innerText) && (b.innerText===c.innerText) &&(a.innerText!=="");
    if(equal){
        coordinates.start=a;
        coordinates.end=c;
    }
    return equal;
}

function gameEnded(){
    guiBoard.style.pointerEvents="none";
    isOver=true;
    label.style.opacity=1;
    label.style.color=currentPlayer.color;
    label.innerText=`${currentPlayer.letter} wins!`;
    playBtn.classList.remove('hidden');
}

function checkForWin(fromMinimax=false,isMax=false){
    //checkrows
    if(isEqual(board[0][0],board[0][1],board[0][2])||
    isEqual(board[1][0],board[1][1],board[1][2])||
    isEqual(board[2][0],board[2][1],board[2][2])){
        if(fromMinimax){
            if(isMax){ // IF isMax it is X turn
                return 'X';
            }
            else{
                return 'O';
            }
            
        }
        drawLine("row",currentPlayer.color);
        gameEnded();
    }
    //check cols
    else if(isEqual(board[0][0],board[1][0],board[2][0])||
    isEqual(board[0][1],board[1][1],board[2][1])||
    isEqual(board[0][2],board[1][2],board[2][2])){
        if(fromMinimax){
            if(isMax){
                return 'X';
            }
            else{
                return 'O';
            }
            
        }
        drawLine("col",currentPlayer.color)
        gameEnded();
    }
    //check diagnol 
    else if(isEqual(board[0][0],board[1][1],board[2][2])){
        if(fromMinimax){
            if(isMax){
                return 'X';
            }
            else{
                return 'O';
            }
            
        }
        drawLine("diagnolleft",currentPlayer.color);
        gameEnded();
    }
    else if(isEqual(board[0][2],board[1][1],board[2][0])){
        if(fromMinimax){
            if(isMax){
                return 'X';
            }
            else{
                return 'O';
            }
            
        }
        drawLine("diagnolright",currentPlayer.color);
        gameEnded();
    }
    else{
        for(let row of board){
            for(let cell of row){
                if(cell.innerText===""){
                    return null
                }
            }
        }
        if(fromMinimax)return 'tie';
        guiBoard.style.pointerEvents="none";
        isOver=true;
        label.style.opacity=1;
        label.style.color="white";
        label.innerText="Draw!";
        playBtn.classList.remove('hidden');
    }

}

function drawLine(mode,color){
    let main=document.querySelector("#main");
    let parent={
        xleft:guiBoard.getBoundingClientRect().left,
        ytop:guiBoard.getBoundingClientRect().top,
        xright:guiBoard.getBoundingClientRect().right,
        ybottom:guiBoard.getBoundingClientRect().bottom,
    }
    let start = {
        xleft:coordinates.start.getBoundingClientRect().left-parent.xleft,
        ytop:coordinates.start.getBoundingClientRect().top-parent.ytop,
        xright:coordinates.start.getBoundingClientRect().right-parent.xleft,
        ybottom:coordinates.start.getBoundingClientRect().bottom-parent.ytop,
    };
    let end = {
        xleft:coordinates.end.getBoundingClientRect().left-parent.xleft,
        ytop:coordinates.end.getBoundingClientRect().top-parent.ytop,
        xright:coordinates.end.getBoundingClientRect().right-parent.xleft,
        ybottom:coordinates.end.getBoundingClientRect().bottom-parent.ytop,
    };

    const svg=document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    const line=document.createElementNS("http://www.w3.org/2000/svg", 'line');

    line.setAttribute("stroke", color);
    line.setAttribute("fill", color);
    line.setAttribute("style","stroke-width:4");

    if(mode==="diagnolleft"){
        line.setAttribute("x1", start.xleft);
        line.setAttribute("y1", start.ytop);
        line.setAttribute("x2", (end.xright));
        line.setAttribute("y2", (end.ybottom));
    }
    if(mode==="diagnolright"){
        line.setAttribute("x1", start.xright);
        line.setAttribute("y1", start.ytop);
        line.setAttribute("x2", (end.xleft));
        line.setAttribute("y2", (end.ybottom));
    }
    if(mode==="row"){
        let half=(start.ybottom-start.ytop)/2
        line.setAttribute("x1", start.xleft);
        line.setAttribute("y1", (start.ytop+half));
        line.setAttribute("x2", (end.xright));
        line.setAttribute("y2", (end.ytop+half));
    }
    if(mode==="col"){
        let half=(start.xright-start.xleft)/2
        line.setAttribute("x1", (start.xleft+half));
        line.setAttribute("y1", (start.ytop));
        line.setAttribute("x2", (end.xleft+half));
        line.setAttribute("y2", (end.ybottom));
    }
    svg.appendChild(line);
    main.insertBefore(svg, main.children[0]);
}

addEvent(cells);