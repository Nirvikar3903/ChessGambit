const  express = require("express");
const socket  = require("socket.io");
const http  = require("http");
const {Chess} = require("chess.js");
const path = require("path")

const app = express();
// initialize http server with express
const server  = http.createServer(app);// http server connected with express
const io = socket(server)// socket works on same server


const chess = new Chess()// initialized chess read chessjs documentation 
let player = {};
let currentPlayer = 'W';

app.set("view engine","ejs");
// app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname , "public")))

app.get("/" , (req ,res)=>{
    res.render("index" , {title:"Chess Game"})
})

server.listen(3000 , function(){
    console.log("listening on port 3000")
})