var express = require('express');  
var bodyParser = require('body-parser');  
var request = require('request');  
var app = express();

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
            if (!weatherMessage(event.sender.id, event.message.text)) {
                sendMessage(event.sender.id, {text: "E: " + event.message.text});
            }
        } else if (event.postback) {
            outfitMessage(event.sender.id, event.message.text);
            console.log("Postback received: " + JSON.stringify(event.postback));
        } else if (event.postback) {
        let text = JSON.stringify(event.postback)
        sendMessage(event.sender.id, "Postback received: "+text.substring(0, 200), token)
        continue
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


/*
function outfitMessage(recipientId, text)  {

    text = text || "";
    var values = text.split(' ');

    if (values.length === 1 && values[0] === 'Toronto') {

            var imageUrl = "https://www.pinterest.com/pin/AdFO5sYa7C0wmM1eNhF3SWn192Ru_VGnAHMnQndpboCJEGWNnrdx2Ek/";

            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Outfit 2",
                            "subtitle": "Toronto",
                            "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Show me the weather"
                            }, {
                                "type": "postback",
                                "title": "I like this",
                                "payload": "User " + recipientId + " likes us " + imageUrl,
                                }],
                            }, {
                                "title": "Outfit 2",
                                "subtitle": "Toronto",
                                //"image_url": imageUrl ,
                                "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Show me the weather"
                            }, {
                                "type": "postback",
                                "title": "I like this",
                                "payload": "User " + recipientId + " likes us " + imageUrl,
                            }],
                        }]
                    }
                }
            };

            sendMessage(recipientId, message);

            return true;
    }

    return false;

};
*/



// send rich message 
function weatherMessage(recipientId, text) {

    text = text || "";
    var values = text.split(' ');

    if (values.length === 1 && values[0] === 'Toronto') {

            var imageUrl = "https://www.theweathernetwork.com/ca/hourly-weather-forecast/ontario/toronto";

            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Toronto",
                            "subtitle": "-2°",
                            "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Show me the weather"
                            }, {
                                "type": "postback",
                                "title": "I like this",
                                "payload": "User " + recipientId + " likes us " + imageUrl,
                                }],
                            }, {
                                "title": "Weather",
                                "subtitle": "Toronto",
                                //"image_url": imageUrl ,
                                "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Show me the weather"
                            }, {
                                "type": "postback",
                                "title": "Show me outfits",
                                "payload": "User " + recipientId + " likes us " + imageUrl,
                            }],
                        }]
                    }
                }
            };

            sendMessage(recipientId, message);

            return true;
    }

    return false;

};

