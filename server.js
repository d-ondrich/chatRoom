const express = require('express');
const app = express();
const server = require('http').Server(app);
const port = 3000; 
const io = require('socket.io')(server);


//namespace for chatbot functions and variables
let forterBot = {};
forterBot.questionFlag = false;
forterBot.question = "";
forterBot.answer = "";
forterBot.questions = {
	"capital of Israel":"Humans are so forgetful, Jerusalem",
    "president of The United States":"That would be Trump",
    "are you sentient":"next question please...."
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
    response.send(io.sockets.adapter.rooms);
});

io.on('connection', function (socket) {
    console.log('A user connected:' + socket.id);

    //alerts new conneciton
    io.emit('user joined', socket.id)

    // receives message from client
    socket.on('chat.message', function (message) {
        blockchainSpace.blockCount++;
        //broadcasts that message
        io.emit('chat.message', message);
        
        //Adds message to new block on blockchain and returns hash to send to client
        messageChain.addNewBlock(new Block(blockchainSpace.blockCount, message));
        let newBlock = messageChain["chain"][blockchainSpace.blockCount].hash;
        //checks chain integrity
        let isValid = messageChain.isChainValid();
        let blockObj = {
            hash : newBlock,
            isValid: isValid
        }
        io.emit('block', blockObj);

        //Handling messages depending on whether bot should respond, or just save question:answer pairs
        let botText = message.text.toLowerCase();
		if (botText.includes("@forterbot")){
			forterBot.readMessage(botText, message);
		} else if (botText.endsWith("?") || forterBot.questionFlag){
			forterBot.saveQuestions(botText, message);
		}
    });

    socket.on('disconnect', function () {
        console.log('User left: ' + socket.id);
        //tell users that someone disconnected
        socket.broadcast.emit('user left', socket.id);
    });
});

forterBot.readMessage = function(botText, message){
    message.user = "ForterBot";
	if (botText.endsWith("?")){
		for (let key in forterBot.questions){
			if (botText.includes(key)){
				message.text = forterBot.questions[key];
				break;
			}
		}
	}else if (botText.includes("print blockchain")){
        message.text = JSON.stringify(messageChain, null, 4);
    }
	io.emit('chat.message', message);
};

forterBot.saveQuestions = function(botText, message){
	if (!forterBot.questionFlag){
		forterBot.question = botText;
		forterBot.questionFlag = true;
	}else{
		forterBot.answer = message.user + ": " + botText
		forterBot.questions[forterBot.question] = forterBot.answer;
		forterBot.questionFlag = false;
	}
}

//Blockchain below:
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
