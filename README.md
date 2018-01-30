# chatroom built using VueJS + socket.io on a node server. Secured on the blockchain!

This chatroom allows for realtime chatting with chatroom users. The chatroom comes with a native user '@forterBot'. 

@forterBot is a naive bot, however he loves to learn! He will remember the answer to questions asked by other users, and will
recall for you that answer by asking: '@forterBot <question>?'

@forterBot is not case sensitive, but he's a stickler for spelling!

@forterBot also comes with a some limited knowledge, and can easily be programmed to know more or connect to external apis. 
Try asking '@forterBot what's the capital of Israel?', or '@forterBot who's the president of The United States?', or...
'@forterBot are you sentient?'. And, if you call '@forterbot' but do not ask him a question he knows he will echo you.

The interesting thing about this particular chatroom is that chat history is immutable and secured on the blockchain. 
In this age of the trustless internet, chat-users need a way to know the messages they see haven't been tampered with.

This chatroom enters the details of each message into a simple, yet secure, proof-of-work blockchain (no promises it can withstand
a 51% attack).
The integrity of the blockchain can be seen at the top of the chat window, along with the lastest block hash.
And, if you ever wish to see the 'ledger' just ask! -- "@forterbot print blockchain'

To get the chatroom up and running: 
        -clone the repository, 
        -navigate to the root folder, 
        -and enter 'node server.js' on you command line.
        
Chatroom will run on port 3000.


