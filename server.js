const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
app.use(express.static("public"));

app.get("/sendEvent", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.emit("CONNECT-LOCAL", '--------->><<----------');
  socket.on("internal_message", (message) => {
    let value = (verifyValidJsonString(message.value))? JSON.parse(message.value): message.value;
      // value = JSON.stringify(value, null, 2);
        io.emit(message.event, value);
    socket.emit("createMessage", message);
  });
});

server.listen(process.env.PORT || 3030);

 const verifyValidJsonString  = (text) => {
  return (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').
  replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
  replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
}