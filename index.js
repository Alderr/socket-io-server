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
  dbConnect();
  runServer();
}

io.on("connection", socket => {
  console.log("Connection?");

  socket.on("disconnect", () => {
    console.log("Disconnection?");
    // socket.leave();
  });

  socket.on('room', (data) => {
    console.log('entering, room triggered..');
    socket.join(data.room); //  room is the # the client will be attached to


    let rooms = Object.keys(socket.rooms);
    console.log(rooms); // [ <socket.id>, 'room 237' ]
    console.log(data);

    // if room data exists, send it; if not start from scratch lol
    RoomModel.findOne({ roomUrl: data.room })
      .then((response) => {
      console.log('​-------------------');
      console.log('FIND ​response', response.googleDoc);
      console.log('​-------------------');
        
      if (response) {
        console.log('SENT DOC RECIEVE EVENT TO CLIENT');
        socket.broadcast.to(socket.id).emit('docRecieve', { start: 'new stuff' , model: response.googleDoc });
      }

      else { 
        return RoomModel.create({ roomUrl: data.room });
      }

      }).then((response) => {
      console.log('​-------------------');
      console.log('​CREATE response', response);
      console.log('​-------------------');
        
      });
  });

  socket.on("docChange", data => {
    console.log('docChange triggered!');
    console.log(data);

    // if room data exists, update it & send; if not start from scratch lol
    return RoomModel.findOneAndUpdate({ roomUrl: data.room }, { googleDoc : data.model })
      .then((response) => {
      console.log('​-------------------');
      console.log('UPDATE ​response', response);
      console.log('​-------------------');
        
      return socket.broadcast.to(data.room).emit('docRecieve', { model: response.googleDoc });
  

      // return RoomModel.create({ roomUrl: data.room });
      });
  });
});


