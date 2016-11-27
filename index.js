'use strict';

const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const WIT_TOKEN = require('config').get("witToken");
const omdb = require('./services/movie');
const PORT = 8765;

let Wit = null;
let log = null;
try {
  // if running from repo
  Wit = require('../').Wit;
  log = require('../').log;
} catch (e) {
	Wit = require('node-wit').Wit;
	log = require('node-wit').log;
}

const sessions = {};

const findOrCreateSession = (socket) => {
  let sessionId;
  Object.keys(sessions).forEach(k => {
    if (sessions[k].socket === socket) {
      sessionId = k;
    }
  });
  if (!sessionId) {
    sessionId = new Date().toISOString();
    sessions[sessionId] = {socket: socket, context: {}};
  }
  return sessionId;
};

// Our bot actions
const actions = {
	send({sessionId},{text}) {
		let socket = sessions[sessionId].socket
		socket.emit('message',text)
		return Promise.resolve()
	},
	getPlot({sessionId, context, text, entities}){
		let socket = sessions[sessionId].socket
		let movie = extractMovie(entities)
		return omdb.getPlot(movie)
				.then(plot=>{
					context.plot = plot
					context.done = true
					return context
				})
	},
	getReview({sessionId, context, text, entities}){
		let socket = sessions[sessionId].socket
		let movie = extractMovie(entities)
		return omdb.getReview(movie)
				.then(review=>{
					context.review = review
					context.done = true
					return context
				})
	},
	getDirector({sessionId, context, text, entities}){
		let socket = sessions[sessionId].socket
		let movie = extractMovie(entities)
		return omdb.getDirector(movie)
				.then(director=>{
					context.director = director
					context.done = true
					return context
				})
	},
	getActors({sessionId, context, text, entities}){
		let socket = sessions[sessionId].socket
		let movie = extractMovie(entities)
		return omdb.getActors(movie)
				.then(actors=>{
					context.actors = actors
					context.done = true
					return context
				})
	},
	getRelease({sessionId, context, text, entities}){
		let socket = sessions[sessionId].socket
		let movie = extractMovie(entities)
		return omdb.getRelease(movie)
				.then(release=>{
					context.release = release
					context.done = true
					return context
				})
	},
	getGenre({sessionId, context, text, entities}){
		let socket = sessions[sessionId].socket
		let movie = extractMovie(entities)
		return omdb.getGenre(movie)
				.then(genre=>{
					context.genre = genre
					context.done = true
					return context
				})
	}
};

// Setting up our bot
const wit = new Wit({
	accessToken: WIT_TOKEN,
	actions,
	logger: new log.Logger(log.INFO)
});

const extractMovie = ({movies=[]})=>{
	return movies[0]?movies[0].value:null
}

// Starting our webserver and putting it all together
const app = express();
const io = require('socket.io').listen(app.listen(PORT));
app.set('port', PORT);
app.set('view engine', 'ejs');
app.use(express.static('public'));

io.on('connection', function (socket) {
	socket.on('message',(msg ='hows the review for harry potter?')=>{
		let sessionId = findOrCreateSession(socket)
		wit.runActions(sessionId, msg, sessions[sessionId].context).then((context) => {
			console.log('new context')
			console.log(context)
			if (context['done']) {
				delete sessions[sessionId];
			}else{
				sessions[sessionId].context = context;
			}
		})
		.catch((err) => {
			console.error('Oops! Got an error from Wit: ', err.stack || err);
		})
	})
});

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname + '/views/index.html'));
});
console.log('Bot Server running... Please open localhost:'+app.get('port')+' in your browser');

module.exports = app;

