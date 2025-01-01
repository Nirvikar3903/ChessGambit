const  express = require("express");
const socket  = require("socket.io");
const http  = require("http");
const {Chess} = require("chess.js");
const path = require("path");
const { connect } = require("http2");

const app = express();
// initialize http server with express
const server  = http.createServer(app);// http server connected with express
const io = socket(server)// socket works on same server


const chess = new Chess()// initialized chess read chessjs documentation 
let player = {};
let currentPlayer = 'w';

app.set("view engine","ejs");
// app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname , "public")))

app.get("/" , (req ,res)=>{
    res.render("index" , {title:"Chess Game"})
})


io.on("connection" , function(uniquesocket){
    console.log("connected ");

    if(!player.white){
        player.white = uniquesocket.id;//if not availagble created 
        uniquesocket.emit("playerRole" , "w")
    }
    else if(!player.black){
        player.black = uniquesocket.id;
        uniquesocket.emit("playerRole" ,"b")
    }
    else{
        uniquesocket.emit("spectatorRole" )
    }

    uniquesocket.on("disconnect" , function(){
        if(uniquesocket.id === player.white){
            delete player.white;
            console.log("White player disconnected.");
        }
        else if(uniquesocket.id === player.black){
            delete player.black
            console.log("Black player diconnected");
        }
    });
    uniquesocket.on("move" ,(move)=>{
        try {
            if(chess.turn() === "w" && uniquesocket.id !== player.white) return ;
            if(chess.turn() === "b" && uniquesocket.id !== player.black) return ;

            const result = chess.move(move);// move excuted in backend 
            if(result){
                currentPlayer = chess.turn();
                io.emit("move" , move)//48 move emitted to frontend from backend
                io.emit("boardState" , chess.fen())
            }
            else{
                console.log("invalid move : " , move);
                uniquesocket.emit("invalidMove",move)// just for user now for everyone thats y uniquesocket 
            }//51
        } catch (error) {
            console.log(error);
            uniquesocket.emit("invalid move", move)
             
        }

    })


    // uniquesocket.on("disconnect" , function(){
    //     console.log("disconnected")
    // })
})  
server.listen(3000 , function(){
    console.log("listening on port 3000")
})