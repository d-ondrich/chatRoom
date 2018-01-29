const express = require('express');
const app = express();
const server = require('http').Server(app);
const port = 3000; //process.env.PORT || 
const io = require('socket.io')(server);

//namespace for chat bot functions and variables
let forterBot = {};
forterBot.questionFlag = false;
forterBot.question = "";
forterBot.answer = "";
forterBot.questions = {
	"capital of Israel":"Jerusalem",
	"president of The United States":"Trump"
}

//namespace for blockchain usage
let blockchainSpace = {};
blockchainSpace.blockCount = 0; 



server.listen(port, function () {
    console.log("Listening on *:" + port);
});

app.use(express.static(__dirname));

app.get('/', function(request,response) {
    response.sendFile(__dirname + '/index.html');
});

app.get('/onlineusers', function(request,response) {
    //console.log(io.sockets.adapter.rooms);
    response.send(io.sockets.adapter.rooms);
});

io.on('connection', function (socket) {
    console.log('A user connected:' + socket.id);

    //Tell all clients that someone connected
    io.emit('user joined', socket.id)

    // The client sends 'chat.message' event to server
    socket.on('chat.message', function (message) {
        blockchainSpace.blockCount++;
        //Emit this event to all clients connected to it
        console.log(message)
        io.emit('chat.message', message);
        
        //Adds message to new block on blockchain and returns hash to send to client
        messageChain.addNewBlock(new Block(blockchainSpace.blockCount, message));
        let newBlock = messageChain["chain"][blockchainSpace.blockCount].hash;
        console.log("printing new block"+ newBlock);
        //checks chain integrity
        let isValid = messageChain.isChainValid();
        let blockObj = {
            hash : newBlock,
            isValid: isValid
        }
        io.emit('block', blockObj);

        //Handling messages depending on whether bot should respond, or just save question:answer pairs
		if (message.text.includes("@forterBot")){
			console.log("should call bot function")
			forterBot.readMessage(message);
		} else if (message.text.endsWith("?") || forterBot.questionFlag){
			console.log("should call question save function")
			forterBot.saveQuestions(message);
		}
    });

    socket.on('disconnect', function () {
        console.log('User left: ' + socket.id);

        //Tell all clients that someone disconnected
        socket.broadcast.emit('user left', socket.id);
    });
});

forterBot.readMessage = function(message){
    message.user = "ForterBot";
    console.log(message.text);
	if (message.text.endsWith("?")){
		for (let key in forterBot.questions){
			if (message.text.includes(key)){
				message.text = "Humans are so forgetful... '"+ forterBot.questions[key] + "'";
				break;
			}
		}
	}
	io.emit('chat.message', message);
	console.log("In bot function");
};

forterBot.saveQuestions = function(message){
	console.log("IN question save function")
	if (!forterBot.questionFlag){
		forterBot.question = message.text;
		forterBot.questionFlag = true;
	}else{
		forterBot.answer = message.user + ": " + message.text
		forterBot.questions[forterBot.question] = forterBot.answer;
		forterBot.questionFlag = false;
	}
}

//Message Blockchain below:
const SHA256 = require('crypto-js/sha256');

class Block { 
    constructor(index, data, previousHash = ''){
        this.index = index;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.index + this.previousHash + JSON.stringify(this.data) + this.nonce).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')){
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined: " + this.hash);
    }
}

class Blockchain {
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 3;
    }

    createGenesisBlock(){
        return new Block(0, 'Genesis Block', '0');
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    addNewBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }
    isChainValid(){
        for (let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash){
                return false;
            }

            return true;
        }
    }
}

let messageChain = new Blockchain();
