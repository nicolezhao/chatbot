var express = require('express');  
var bodyParser = require('body-parser');  
var request = require('request');  
var app = express();

var weather = require('openweather-apis');
weather.setLang('en');
weather.setAPPID('b79ca3d3ebd382d195294ae0880dc596');
weather.setUnits('metric');

app.use(bodyParser.urlencoded({extended: false}));  
app.use(bodyParser.json());  
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {  
    res.send('This is Chatbot Server');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {  
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hubw.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});


// handler receiving messages
app.post('/webhook', function (req, res) {  
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {  
            var text = event.message.text;
            console.log(text);
            // getStarted(event.sender.id);

            if (text){
                var temp = getWeather(event.sender.id, text);
                weatherMessage(event.sender.id, text, temp);
            }
            else{
                sendMessage(event.sender.id, {text: "Could not process your message :("});
            }
           
        } else if (event.postback) {
            if (event.postback.payload == get_started){
                sendMessage(event.sender.id, {text: "Let's get started"});
            } else if(event.postback.payload == 'Call outfits function'){
                //message = {text: "Here are some outfits!"};
                //sendMessage(event.sender.id, message);
                outfitMessage(event.sender.id);
                //sendMessage(event.sender.id, {text: outfitMessage(event.sender.id)});
                console.log("Postback received: " + JSON.stringify(event.postback));
            } else if (event.postback.payload == 'Like'){
                sendMessage(event.sender.id, {text: "Come back anytime for more!"});
            }
        }
    }
    res.sendStatus(200);
});

// generic function sending messages
function sendMessage(recipientId, message) {  
        request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });

};


function initialMessage(recipientId)  {

    message ={
    "text":"Pick a city:",
    "quick_replies":[
      {
        "content_type":"text",
        "title":"Toronto",
        "payload":"Toronto"
      },
      {
        "content_type":"text",
        "title":"San Fran",
        "payload":"San Fran"
      }
    ]
  }

    sendMessage(recipientId, message);
    return true;

};



function outfitMessage(recipientId)  {

    //text = text || "";
    //var values = text.split(' ');

            var imageUrl = "https://www.pinterest.com/pin/AdFO5sYa7C0wmM1eNhF3SWn192Ru_VGnAHMnQndpboCJEGWNnrdx2Ek/";

            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Outfit 1",
                            "subtitle": "Got it",
                            "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Outfits like this"
                            }, {
                                "type": "postback",
                                "title": "I like this",
                                "payload": "Like",
                                }],
                            }, {
                                "title": "Outfit 2",
                                "subtitle": "Got it",
                                //"image_url": imageUrl ,
                                "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Outfits like this"
                            }, {
                                "type": "postback",
                                "title": "I like this",
                                "payload": "Like",
                            }],
                        }]
                    }
                }
            };

            sendMessage(recipientId, message);
            return true;

};

function getWeather(recipientId, text){

weather.setCity(text);
    weather.getTemperature(function(err, temp){
        console.log(temp);
    });
    return temp;
}

// send rich message 
function weatherMessage(recipientId, text, degree) {

    var city = text;
    var degrees = temp;

    // if (values.length === 1 && values[0] === 'Toronto') {

            var imageUrl = "https://www.theweathernetwork.com/ca/hourly-weather-forecast/ontario/toronto";

            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": city,
                            "subtitle": degrees,
                            "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Show me the weather"
                            }, {
                                "type": "postback",
                                "title": "Show me outfits",
                                "payload": "Call outfits function",
                                }],
                            }, {
                                "title": city,
                                "subtitle": "weather °",
                                //"image_url": imageUrl ,
                                "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Show me the weather"
                            }, {
                                "type": "postback",
                                "title": "Show me outfits",
                                "payload": "Call outfits function",
                                //MIGHT BE USEFUL LATER: "payload": "User " + recipientId + " likes us ",
                            }],
                        }]
                    }
                }
            };

            sendMessage(recipientId, message);

            return true;
    // }

    // return false;

};

