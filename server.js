var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views');

app.get('/the_wall',function(req,res){
	url = 'http://thewall.tw/shows';
	var json =[];
	request(url, function(error, response, html){

		if(!error){
			var $ = cheerio.load(html);

			var date, artist, ticket_price,place,time;
			var item = {date : "", artist : "", ticket_price : "", place : "", times : ""};
		
			var items = $('.span3').length;

			for (var i=0;i<items;i++ ){
				var m=$('.span3 .date .m')[i];
				var month = $(m).text();
				var d=$('.span3 .date .d')[i];
				var day = $(d).text();
				var infor  = $('.span3 tbody').eq(i);
				var date = '2015/'+month+'/'+day;
				if($(infor).find('td').length===4){
					var artist = $('.span3 .title').eq(i).text();
					var ticket_price= $(infor).find('td').eq(1).text();
					var place= $(infor).find('td').eq(2).text();
					var time= $(infor).find('td').eq(3).text();			
				}
				else if($(infor).find('td').length===3){
					var artist = $('.span3 .title').eq(i).text();
					var ticket_price= $(infor).find('td').eq(0).text();
					var place= $(infor).find('td').eq(1).text();
					var time= $(infor).find('td').eq(2).text();
				}

				json.push({'date' : date, 'artist' : artist, 'ticket_price' :ticket_price, 'place' :place, 'times' :time});	
			}
			

		}


        //res.send('Check your console!')
        res.json(json);
	})

})

app.get('/indievox',function(req,res){
	url = 'http://www.indievox.com/event/get-more-event-date-list?style=table_row&content=event_ticket&content_container_id=event-ticket-block&start_date=2015-07-28&end_date=2015-12-31&key_word=&load_more=1&pagenation_type=col-lg-10-more-row&pagenation_expand_col=4&offset=0&length=70';
	var json =[];
	request(url, function(error, response, html){

		if(!error){
			var $ = cheerio.load(html);
		
			var items = $('h5').length;

			for (var i=0;i<items;i++ ){
					var artist = $('h5 a').eq(i).text();
					var temp= $('p').eq(i).text();
					temp = temp.split('時間');
					var p = temp[0].split('場館');
					//var ticket_price= $(infor).find('td').eq(1).text();
					var place= p[1];
					var dates= temp[1].split(' ');
					var date = dates[0].split('(')[0].trim();
				json.push({'date' :date , 'artist' : artist, 'ticket_price' :'', 'place' :place, 'times' :dates[1]});	
			}
			

		}
        res.json(json);
	})

})
app.get('/legacy',function(req,res){
	var year = req.query.year;
	var month = req.query.month;
	url = 'http://www.legacy.com.tw/programlist/';
	var json =[];
	request.post(url, 
	    {
	    	form:{ website_string: year,website_string1:month }
	    }, 
	    function(error, response, html){
	        if(!error){
			var $ = cheerio.load(html);
			var items = $('.gallery-slide-wrap1083').length;
			for (var i=0;i<items;i++ ){
				var artist = $('.gallery-slide-wrap1083 h3').eq(i).text();
				var place = $('.gallery-slide-wrap1083').eq(0).find('p').eq(1).text();
				var dates =  $('.gallery-slide-wrap1083').eq(0).find('p').eq(3).text().split('：')[1].split(' ')[0].trim();
				json.push({'date' :dates , 'artist' : artist, 'ticket_price' :'', 'place' :place, 'times' :''});	
				//$('.gallery-slide-wrap1083').eq(i).find('.performance2 col-lg-12 p').text();
				
			}
		}
		 res.json(json);
	});
	
			
})

app.get('/', function(req, res){

		// Render views/home.html
		res.render('home');
	});


var jsonAll=[];
var re = new RegExp('/', 'g');
app.get('/all',function(req,res){
	jsonAll=[];
	var StartDate = req.query.start_date;
	var EndDate = req.query.end_date;
	var year_q = StartDate.split('/')[0];
	var month_q = StartDate.split('/')[1];
	StartDate = StartDate.replace(re,'');
	EndDate = EndDate.replace(re,'');

	url = 'http://thewall.tw/shows';
	request(url, function(error, response, html){

		if(!error){
			var $ = cheerio.load(html);

			var date, artist, ticket_price,place,time;
			var item = {date : "", artist : "", ticket_price : "", place : "", times : ""};
		
			var items = $('.span3').length;

			for (var i=0;i<items;i++ ){
				var m=$('.span3 .date .m')[i];
				var month = $(m).text();
				var d=$('.span3 .date .d')[i];
				var day = $(d).text();
				var infor  = $('.span3 tbody').eq(i);
				var date = '2015/'+month+'/'+day;
				var date_num = date.replace(re,'');
				var img_src = $('.span3 .poster').eq(i).find('img').attr('src');
				if($(infor).find('td').length===4){
					var artist = $('.span3 .title').eq(i).text();
					var ticket_price= $(infor).find('td').eq(1).text();
					var place= $(infor).find('td').eq(2).text();
					var time= $(infor).find('td').eq(3).text();			
				}
				else if($(infor).find('td').length===3){
					var artist = $('.span3 .title').eq(i).text();
					var ticket_price= $(infor).find('td').eq(0).text();
					var place= $(infor).find('td').eq(1).text();
					var time= $(infor).find('td').eq(2).text();
				}
				if(date_num>=StartDate&&date_num<=EndDate){
					jsonAll.push({'date' : date, 'artist' : artist, 'ticket_price' :ticket_price, 'place' :'The Wall - '+place, 'times' :time,'img':img_src});	
				}
			}
			
		}
		 	url2 = 'http://www.indievox.com/event/get-more-event-date-list?style=table_row&content=event_ticket&content_container_id=event-ticket-block&start_date=2015-07-28&end_date=2015-12-31&key_word=&load_more=1&pagenation_type=col-lg-10-more-row&pagenation_expand_col=4&offset=0&length=70';

			request(url2, function(error, response, html){

				if(!error){
					var $ = cheerio.load(html);
				
					var items = $('h5').length;

					for (var i=0;i<items;i++ ){
						    var img_src =$('.post-img').eq(i).attr('src');
							var artist = $('h5 a').eq(i).text();
							var temp= $('p').eq(i).text();
							temp = temp.split('時間');
							var p = temp[0].split('場館');
							//var ticket_price= $(infor).find('td').eq(1).text();
							var place= p[1];
							var dates= temp[1].split(' ');
							var date_i = dates[0].split('(')[0].trim();
							var date_num = date_i.replace(re,'');
							if(date_num>=StartDate&&date_num<=EndDate){
								jsonAll.push({'date' :date_i , 'artist' : artist, 'ticket_price' :'', 'place' :place, 'times' :dates[1],'img':img_src});	
								}
						}
					

					}
					url3 = 'http://www.legacy.com.tw/programlist/';
					request.post(url3, 
					    {
					    	form:{ website_string: year_q,website_string1:month_q }
					    }, 
					    function(error, response, html){
					        if(!error){
							var $ = cheerio.load(html);
							var items = $('.gallery-slide-wrap1083').length;
							for (var i=0;i<items;i++ ){
								var img_src=$('.gallery-slide-wrap1083 .imagepos').eq(i).attr('src');
								
								var artist = $('.gallery-slide-wrap1083 h3').eq(i).text();
								var place = $('.gallery-slide-wrap1083').eq(i).find('p').eq(1).text();
								var dates_l =  $('.gallery-slide-wrap1083').eq(i).find('p').eq(3).text().split('：')[1].split(' ')[0].trim();
								var date_num = dates_l.replace(re,'');
								if(date_num>=StartDate&&date_num<=EndDate){
								jsonAll.push({'date' :dates_l , 'artist' : artist, 'ticket_price' :'', 'place' :place, 'times' :'','img':img_src});	
								}
								//$('.gallery-slide-wrap1083').eq(i).find('.performance2 col-lg-12 p').text();
								
							}
						}
		 				res.json(jsonAll);
					});
						
					

		})
	})


	
})
app.get('/scrape', function(req, res){
	// Let's scrape Anchorman 2
	url = 'http://www.imdb.com/title/tt1229340/';

	request(url, function(error, response, html){
		if(!error){
			var $ = cheerio.load(html);

			var title, release, rating;
			var json = { title : "", release : "", rating : ""};

			$('.header').filter(function(){
		        var data = $(this);
		        title = data.children().first().text();
		        release = data.children().last().children().text();

		        json.title = title;
		        json.release = release;
	        })

	        $('.star-box-giga-star').filter(function(){
	        	var data = $(this);
	        	rating = data.text();

	        	json.rating = rating;
	        })
		}

		fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
        	console.log('File successfully written! - Check your project directory for the output.json file');
        })

        //res.send('Check your console!')
        res.json(json);
	})
})
var port = process.env.PORT || 8080;
app.listen(port)
console.log(port);
exports = module.exports = app; 	