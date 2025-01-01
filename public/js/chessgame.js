const socket = io(); // automatically send req to backend for connection to io.on when refreshed 
const chess = new Chess();


const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null ;

const renderBoard = ()=>{
    const board = chess.board(); // imports boar from chess.js all position of elements
    boardElement.innerHTML = ""; 

    board.forEach((row , rowindex)=> {
        row.forEach((square , squareindex)=>{
            // console.log(square);
            const squareElement = document.createElement("div");
            squareElement.classList.add("square" , 
                (rowindex + squareindex)% 2 === 0 ? "light":"dark"
            );
            // console.log(squareElement)

            //here we have given value to every square rowIndex and squareIndex
            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex;

            // if square is not null 
            if(square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece" , square.color === 'w' ? 'white' :'black');
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;


                pieceElement.addEventListener("dragstart" , (e)=>{
                    draggedPiece = pieceElement;
                    sourceSquare = {row :rowindex , col:squareindex} 
                    e.dataTransfer.setData("text/plain" ,"")// prevents dragged piece issues
                })

                pieceElement.addEventListener("dragend" , (e)=>{
                    draggedPiece =null;
                    sourceSquare = null;
                })

                squareElement.appendChild(pieceElement)
            };

            // caseHandelling for dragging piece over another
            squareElement.addEventListener("dragover" , function(e){
                e.preventDefault();
            })


            squareElement.addEventListener("drop" , function(e){
                e.preventDefault();
                if(draggedPiece){
                    const targetSource  = {

                        //here ve have assignied row/col the value we have assigned to each square above  
                        row: parseInt(squareElement.dataset.row) ,
                        col: parseInt(squareElement.dataset.col) ,
                    }
                    handleMove(sourceSquare , targetSource);
                }
            });
            boardElement.appendChild(squareElement);
        });
    });

    if(playerRole === "b"){
        boardElement.classList.add("flipped")// class added
    }
    else{
        boardElement.classList.remove("flipped")// 
    }
    // boardElement.classList.toggle("flipped", playerRole === "b");

    
};

const handleMove = (source , target) =>{
    const move ={
        from: `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to: `${String.fromCharCode (97+target.col)}${8-target.row}`,
        promotion: "q" , // of pawn into knight
    }
    socket.emit("move" , move);
};


const getPieceUnicode = (piece ) =>{
const unicodePieces ={
    // p:"♟",
    p:"♙",
    r:"♜",
    n:"♞",
    b:"♝",
    q:"♛",
    k:"♚",
    P:"♙",
    R:"♖",
    N:"♘",
    B:"♗",
    Q:"♕",
    K:"♔",
  };
  return unicodePieces [piece.type] || ""; // return peices if type are found else kept blank
}


// Now we have to send data to the backend SOCKET CLIENT SIDE

socket.on("playerRole", function(role){
    console.log("Player Role:", role);
    playerRole = role;
    renderBoard();// render board on the basis of that role
})
socket.on("spectatorRole" , function(){
    playerRole = null ; // hes just a spectator
    renderBoard();// render board for spectator 
})
 socket.on("boardState" ,function(fen){
    chess.load(fen);// change board state on the basis of FEN notation 
    renderBoard()
 })

 socket.on("move" , function(move){// receive move 
    chess.move(move);// use that move 
    renderBoard();
 })

renderBoard();

