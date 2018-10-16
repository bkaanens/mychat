var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var userNames = ["Alf", "Berit", "Charlie", "David", "Erik", "Frøydis", "Garfield", "Haldis", "Inger", "Johan", "Kjersti", "Lukas", "Magnus"];
var takenUserNames = [];

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

    //New user connection: Add username to taken user names array. Dispatch event for users connected
    socket.on('new user', function(callback) {
        var fetchUserName = true;
        var i = 0;      
        var tmpname;        
        while (fetchUserName && i < userNames.length) {               
            tmpname = userNames[i];
            if (takenUserNames.indexOf(tmpname) == -1) {
                console.log("new user connected: " + tmpname);
                takenUserNames.push(tmpname);
                socket.userName = tmpname;
                io.sockets.emit('usernames', takenUserNames);
                io.emit('broadcast', "* " + socket.userName + ' connected')
                callback(true);
                fetchUserName = false;
            } else {
                i++;                
            }       
        }
        //Chat room is full. Try again later
        if (i >= userNames.length  ) {
            console.log("chatroom is full");
            callback(false);
        }
        
    });
    
    //User disconnected: Dispatch disconnect event and remove from taken usernames array.
    socket.on('disconnect', function(){
        console.log(socket.userName + ' disconnected');       
        if (!socket.userName) return;
        io.emit('disconnect', '* ' + socket.userName + ' disconnected');
        takenUserNames.splice(takenUserNames.indexOf(socket.userName), 1);
    });
    
    //New messages: Dispacth event with message
    socket.on('chat message', function(msg){
        if (msg.length > 0) {
            io.emit('chat message', {user: socket.userName, message: msg});
        }
    });
});

/*io.emit('some event', {for: 'everyone'});*/

http.listen(3000, function() {
    console.log('listening on *:3000');
});