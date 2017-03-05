//Problem: Make a weather app that will recive current wether with country and postal code
//Solve: Get API from http://openweathermap.org/ and make interactive search for weather using console

var http = require('http');

//Print message
function printWeather(city, weather) {
    var message = 'In ' + city + ', there is ' + weather + ' degrees.';
    console.log(message);
}

//Print out error messages
function printError(error) {
    console.error(error.message);
}

//Connect to the API URL api.openweathermap.org/data/2.5/weather?q={city name},{country code}
module.exports =function get(city){
    var request = http.get('http://api.openweathermap.org/data/2.5/weather?q='+ city + '&units=metric', function(response) {
    var body = '';

    //Read the data
    response.on('data', function(chunk) {
        body += chunk;
    });

    response.on('end', function() {
        if (response.statusCode === 200) {
            try {
                //Parse the data
                var weatherAPI = JSON.parse(body);

                //Print the data
                printWeather(weatherAPI.name, weatherAPI.main.temp);
            } catch(error) {
                //Parse error
                printError(error);
            }
        } else {
            //Status Code error
            printError({message: 'There was an error getting the weather from ' + city + '. (' + http.STATUS_CODES[response.statusCode] + ')'});
        }
    })
});

//Connection error
request.on('error', function (err) {

printError(err);

});

};
