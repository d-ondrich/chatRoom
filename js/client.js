var socket = io();

    new Vue({
        el: '#app',
        data: {
            connectedUsers: ["forterBot"],
            messages: [],
            blocks: [],
            blockchainStatus: [true],
            message: {
                "index":"",
                "type": "",
                "user": "",
                "text": "",
                "timestamp": ""
            },
        },
        created: function () {
            //if server emits 'user joined', update connectedUsers array
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

            // if server emits 'chat.message', update messages array
            socket.on('chat.message', function (message) {
                this.messages.push(message);
            }.bind(this));

            // if server emits 'block', update blockchain visual
            socket.on('block', function (blockObj) {
                console.log("client side printing " + blockObj.hash);
                this.blockchainStatus.push(blockObj.isValid);
                this.blocks.push(blockObj.hash);
            }.bind(this));

            //if server broadcasts 'user left', remove leaving user from connectedUsers array
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
                this.message.user = socket.id;
                this.message.timestamp = moment().calendar();
                socket.emit('chat.message', this.message);
                this.message.type = '';
                this.message.user = '';
                this.message.text = '';
                this.message.timestamp = '';

            },
        }
    });