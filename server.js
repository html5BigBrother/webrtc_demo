const WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8888 }),
    users = {};

wss.on("connection", connection => {
    console.log("User connected");

    connection.on("message", message => {
        // console.log("Got message:", message);
        let data, conn;

        try {
            data = JSON.parse(message);
        } catch (e) {
            console.log(e);
            data = {};
        }


        switch (data.type) {
            case "login":
                console.log("User logged in as", data.name);
                // if (users[data.name]) {
                //     sendTo(connection, {
                //         type: "login",
                //         success: false
                //     });
                // } else {
                    users[data.name] = connection;
                    connection.name = data.name;
                    sendTo(connection, {
                        type: "login",
                        success: true
                    });
                // }
                break;

            case "offer":
                console.log("sending offer to:", data.name);
                conn = users[data.name];

                if (conn != null) {
                    connection.otherName = data.name;
                    sendTo(conn, {
                        type: "offer",
                        offer: data.offer,
                        name: connection.name
                    });
                }
                break;

            case "answer":
                console.log("sending answer to:", data.name);
                conn = users[data.name];

                if (conn != null) {
                    connection.otherName = data.name;
                    sendTo(conn, {
                        type: "answer",
                        answer: data.answer
                    })
                }
                break;

            case "candidate":
                console.log("sending to", data.name);
                conn = users[data.name];

                if (conn != null) {
                    sendTo(conn, {
                        type: "candidate",
                        candidate: data.candidate
                    });
                }
                break;

            case "leave":
                console.log("Disconnected user from ", data.name);
                conn = users[data.name];
                conn.otherName = null;

                if (conn != null) {
                    sendTo(conn, {
                        type: "leave"
                    });
                }
                break;

            default:
                sendTo(connection, {
                    type: "error",
                    message: "Unrecognized command: " + data.type
                });

                break;
        }
    });

});

// wss.on("close", function(){
//     if(connection.name){
//         delete users[connection.name];

//         if(connection.otherName) {
//             console.log("Disconnected,",connection.otherName);
//             let conn = users[connection.otherName];
//             conn.otherName = null;

//             if(conn != null){
//                 sendTo(conn,{
//                     type: "leave"
//                 });
//             }
//         }
//     }
// });

wss.on("listening", () => {
    console.log("Server started...");
});

function sendTo(conn, message) {
    conn.send(JSON.stringify(message));
}