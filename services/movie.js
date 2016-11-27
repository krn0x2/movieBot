'use strict';

const fetch = require('node-fetch')
var omdb = () => {
	function getMovie(movie){
		return fetch(`http://www.omdbapi.com/?s=${movie}&type=movie&r=json`)
		.then(data=>data.json())
		.then(({Search})=>{
			if(!Search.length){
				return 'Sorry, we could not find any movie by that name';
			}
			else{
				let imdbID = Search[0].imdbID
				return fetch(`http://www.omdbapi.com/?i=${imdbID}&type=movie&plot=short&r=json&tomatoes=true`)
			}
		})
		.then(data=>data.json())
		.catch(err=>err)
	}

	return {
		getPlot:function(movie){
			return getMovie(movie)
					.then(({Title,Plot})=>`${Title}\n${Plot}`)
		},
		getReview:function(movie){
			return getMovie(movie)
					.then(({imdbRating,Metascore,tomatoMeter})=>{
						let ratings = `${imdbRating!="N/A"?'IMDB:'+imdbRating:''}\t${Metascore!="N/A"?'Metacritic:'+Metascore:''}\t${tomatoMeter!="N/A"?'Rotten Tomatoes:'+tomatoMeter:''}`
						if(imdbRating=="N/A"){
							return `We don't have any ratings for this movie`
						}else if(imdbRating<5){
							return `${ratings}\nRating:Bad. Watch it at your own risk!`
						}else if(imdbRating>=5 && imdbRating<7){
							return `${ratings}\nRating:Average. A one time watch.`
						}else{
							return `${ratings}\nRating:Excellent. Club it with large popcorn!`
						}
					})
		},
		getDirector:function(movie){
			return getMovie(movie)
					.then(({Director})=>`Directed By: ${Director}`)
		},
		getActors:function(movie){
			return getMovie(movie)
					.then(({Actors})=>`Starring: ${Actors}`)
		},
		getRelease:function(movie){
			return getMovie(movie)
					.then(({Released})=>`Released: ${Released}`)
		},
		getGenre:function(movie){
			return getMovie(movie)
					.then(({Genre})=>`${Genre}`)
		},
	}
}
module.exports = omdb()

