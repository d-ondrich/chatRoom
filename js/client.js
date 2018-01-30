var socket = io();
var id;
var oldName;
    new Vue({
        el: '#app',
        data: {
            connectedUsers: ["forterBot"],
            name,
            messages: [],
            blocks: [],
            blockchainStatus: [true],
            message: {
                "index":"",
                "type": "",
                "user": "",
                "socketID":"",
                "text": "",
                "timestamp": ""
            },
        },
        created: function () {
            
            socket.on('connect', function(){
                id = socket.io.engine.id;
            })
            //updates connectedUsers array
            socket.on('user joined', function (socketId) {
                // get already connected users first
                axios.get('/onlineusers')
                .then(function (response) {
                    for(var key in response.data) {
                        if(this.connectedUsers.indexOf(key) <= -1) {
                            this.connectedUsers.push(key);
                        }
                    }
                    console.log(this.connectedUsers);
                }.bind(this));
                var infoMsg = {
                    "type": "info",
                    "msg": "User " + socketId + " has joined"
                }
                this.messages.push(infoMsg);
            }.bind(this));

            // updates messages array
            socket.on('chat.message', function (message) {
                if (message.socketID !== message.user){
                    let index = this.connectedUsers.indexOf(message.socketID)
                    if (index !== -1){
                        this.connectedUsers[index] = message.user;
                    }
                }
                this.messages.push(message);
                this.$nextTick(() => { //calls scroll to bottom function
                    this.scrollToBottom()
                  })
            }.bind(this));

            // updates blockchain visual hash and integrity
            socket.on('block', function (blockObj) {
                this.blockchainStatus.push(blockObj.isValid);
                this.blocks.push(blockObj.hash);
            }.bind(this));

            // remove leaving user from connectedUsers array
            socket.on('user left', function (socketId) {
                var index = this.connectedUsers.indexOf(socketId);
                if(index >= 0) {
                    this.connectedUsers.splice(index,1);
                }
                var infoMsg = {
                    "type": "info",
                    "msg": "User " + socketId + " has left"
                }
                this.messages.push(infoMsg);
            }.bind(this));
        },
        methods: {
            send: function () {
                this.message.type = "chat";
                if (id){
                    this.message.user = id;//looks for nickname
                }else{
                    this.message.user = socket.id;
                }
                this.message.timestamp = moment().calendar();
                this.message.socketID = socket.id;
                socket.emit('chat.message', this.message);
                this.message.type = '';
                this.message.user = '';
                this.message.text = '';
                this.message.timestamp = '';
            },
            //updates name from socket id
            setName: function(){
                let index = this.connectedUsers.indexOf(socket.id);
                if (index !== -1) {
                    this.connectedUsers[index] = this.name;
                }
                id = this.name;
                disableInput(false);//prevents changing name
            },
            //scrolls to bottom of message window
            scrollToBottom: function(){
                var chatArea = this.$el.querySelector("#chatArea");
                chatArea.scrollTop = chatArea.scrollHeight;
            }
        }
    });