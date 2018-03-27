'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { PORT } = require('./config');
const { dbConnect } = require('./db-mongoose');
// const {dbConnect} = require('./db-knex');
let server;
const app = express();
const io = require('socket.io')();

const RoomModel = require('./roomModel');

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(cors());


function runServer(port = PORT) {
  server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });

    io.attach(server);
}

if (require.main === module) {
  // dbConnect();
  runServer();
}

io.on("connection", socket => {
  console.log("Connection?");

  socket.on("disconnect", () => {
    console.log("Disconnection?");
  });

  socket.on('room', (data) => {
    console.log('entering, room triggered..');
    socket.join(data.room); // room is the # the client will be attached to
    console.log(socket.rooms); // all rooms made so far
    console.log(data);
  });

  socket.on("docChange", data => {
    console.log('docChange triggered!');
    console.log(data);
    socket.broadcast.to(data.room).emit('docRecieve', { model: data.model });
  });
});


