var express = require('express');  
var bodyParser = require('body-parser');  
var request = require('request');  
var app = express();
var weather = require("weather.js");

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
                weatherMessage(event.sender.id, text);
            }

            // if(text == 'hello'){
            //     initialMessage(event.sender.id);
            // } else if (text =='Toronto'){
            //     weatherMessage(event.sender.id, text);
            // } else if (text == 'San Fran'){
            //     weatherMessage(event.sender.id, text);
            // }
            else{
                sendMessage(event.sender.id, {text: "Could not process your message :("});
            }
           
        } else if (event.postback) {
            if (event.postback.payload == 'Call outfits function'){
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

// function getStarted(recepientID){
//     greeting:[
//     {
//       "locale":"default",
//       "text":"Hello!"
//     }, {
//       "locale":"en_US",
//       "text":"Timeless apparel for the masses."
//     }
//   ] 
//   sendMessage(recepientId, greeting);
//   return true; 
// };

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


// send rich message 
function weatherMessage(recipientId, text) {

    var city = text;
    Weather.getCurrent(city, function(current) {
      console.log(
        ["currently:",current.temperature(),"and",current.conditions()].join(" ")
      )
    })

    // if (values.length === 1 && values[0] === 'Toronto') {

            var imageUrl = "https://www.theweathernetwork.com/ca/hourly-weather-forecast/ontario/toronto";

            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": city,
                            "subtitle": "-2°",
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
                                "title": "Weather",
                                "subtitle": city,
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

