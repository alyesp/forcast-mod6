var cityInputEl = $('#city-input');
var searchBtn = $('#search-button');
var clearBtn = $('#clear-button');
var pastSearchedCityEl = $('#past-searches');
var apikey = '5e51bd9c5cc145ef9b56e8b0da79d03a';

var currentCity;

function getWeather(data) {

    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${data.lat}&lon=${data.lon}&appid=${apikey}`
    fetch(requestUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data){
            console.log(data)
            var currentConditionsEl = $('#currentConditions');
            currentConditionsEl.addClass('border border-primary');
            
            var cityNameEl = $('<h2>');
            cityNameEl.text(currentCity);
            currentConditionsEl.append(cityNameEl);

            var currentCityDate = data.dt;
            currentCityDate = moment.unix(currentCityDate).format("MM/DD/YYYY");

            var currentDateEl = $('<span>');
            currentDateEl.text(`(${currentCityDate})`);
            cityNameEl.append(currentDateEl);

            var currentCityWeatherIcon = data.weather[0].icon;
            var currentWeatherIconEl = $('img');
            currentWeatherIconEl.attr("src", "http://openweathermap.org/img/wn/" + currentCityWeatherIcon + ".png");
            cityNameEl.append(currentWeatherIconEl);

            var currentCityTemp = data.main.temp;
            var currentTempEl = $('<p>');
            currentTempEl.text(`Temp: ${currentCityTemp}°C`)
            currentConditionsEl.append(currentTempEl);

            var currentCityWind = data.wind.speed;
            var currentWindEl = $('<p>')
            currentWindEl.text(`Wind: ${currentCityWind} KPH`)
            currentConditionsEl.append(currentWindEl);

            var currentCityHumidity = data.main.humidity;
            var currentHumidityEl = $('<p>')
            currentHumidityEl.text(`Humidity: ${currentCityHumidity}%`)
            currentConditionsEl.append(currentHumidityEl);

            var currentCityUV = data.uvi;
            var currentUvEl = $('<p>');
            var currentUvSpanEl = $('<span>');
            currentUvEl.append(currentUvSpanEl);

            currentUvSpanEl.text(`UV: ${currentCityUV}`)

            if (currentCityUV < 3) {
                currentUvSpanEl.css({'background-color':'green','color':'white'});
            } else if (currentCityUV < 6) {
                currentUvSpanEl.css({'background-color':'yellow','color':'black'});
            } else if (currentCityUV < 8) {
                currentUvSpanEl.css({'background-color':'orange','color':'white'});
            } else if (currentCityUV < 11) {
                currentUvSpanEl.css({'background-color':'red','color':'white'});
            } else {
                currentUvSpanEl.css({'background-color':'violet','color': 'white'});
            }

            //currentUvSpanEl.append(currentUvEl);

            //5 day forecast
            // create 5 day forecast <h2> header
            var fiveDayForeHeaderEl = $('#fiveDayForeHeader');
            var fiveDayHeaderEl = $('<h2>');
            fiveDayHeaderEl.text('5 Day Forecast:');
            fiveDayForeHeaderEl.append(fiveDayHeaderEl);

            var fiveDayForecastEl = $('#fiveDayForecast');

            //get key weather info from API data for 5 day forecast
            console.log(data)
            for (var i = 1; i <= 5; i++) {
                var date;
                var temp = data.main.temp;
                var icon = data.weather[0].icon;
                var wind = data.wind.speed;
                var humidity = data.main.humidity;

                date = data.dt;
                date = moment.unix(date).format("MM/DD/YYYY");

                // temp = data.main.temp;
                // icon = data.weather[0].icon;
                // wind = data.wind.speed;
                // humidity = data.humidity;

                //create display box
                var displayBox = document.createElement('div');
                displayBox.classList.add('card','col-3', 'm-1', 'bg-primary', 'text-white');

                var displayBody = document.createElement('div');
                displayBody.classList.add('display-body');
                displayBody.innerHTML = `<h6>${date}</h6>
                                        <img src= "http://openweathermap.org/img/wn/${icon}.png"> </> <br>
                                        ${temp}°C <br>
                                        ${wind} KPH <br>
                                        ${humidity} %`

                displayBox.appendChild(displayBody);
                fiveDayForecastEl.append(displayBox);
            }
        })
    return;
}

//display search history as buttons
function displaySearchHist() {
    var storedCities = JSON.parse(localStorage.getItem("cities")) || [];
    var pastSearchesEl = document.getElementById('past-searches');

    pastSearchesEl.innerHTML = '';

    for (i = 0; i < storedCities.length; i++) {
        var pastCityBtn = document.createElement("button");
        pastCityBtn.classList.add("btn", "btn-primary","my-2","past-city");
        pastCityBtn.textContent = `${storedCities[i].city}`;
        pastSearchesEl.appendChild(pastCityBtn);
    }
    return;
}

//Use Open Weather Current weather API to get the city coordinates

function getCoordinates() {
    console.log("current-city")
    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${apikey}`;
    var storedCities = JSON.parse(localStorage.getItem("cities")) || [];

    fetch(requestUrl)
        .then(function(response){
            if(response.status >= 200 && response.status <= 299) {
                return response.json();
            }else {
                throw Error(response.statusText);
            }
        })
        .then(function(data) { 
            var cityInfo = {
                city: currentCity,
                lon: data.coord.lon,
                lat: data.coord.lat
            }

            storedCities.push(cityInfo);
            localStorage.setItem("cities",JSON.stringify(storedCities));

            //displaySearchHistory();

            return cityInfo;
        })
        .then(function (data) {
            getWeather(data);
        })
        return;
}

//handle request to clear past search history
function handleClearHistory (event) {
    event.preventDefault();
    var pastSearchesEl = document.getElementById('past-searches');

    localStorage.removeItem("cities");
    pastSearchesEl.innerHTML = '';

    return;
}

function clearCurrentCityWeather () {
    var currentConditionsEl = document.getElementById("currentConditions");
    currentConditionsEl.innerHTML = '';

    var fiveDayForecastHeaderEl = document.getElementById("fiveDayForecastHeader");
    fiveDayForecastHeaderEl.innerHTML = '';

    var fiveDayForecastEl = document.getElementById("fiveDayForecast");
    fiveDayForecastEl.innerHTML = '';

    return;
}

function handleCityFormSubmit (event) {
    event.preventDefault();
    currentCity = cityInputEl.val().trim();

    clearCurrentCityWeather();
    getCoordinates();

    return;
}

//when user clicks on city previous searched, and updates will be shown

function getPastCity(event) {
    var element = event.target;

    if(element.matches(".past-city")) {
        currentCity = element.textContent;

        clearCurrentCityWeather();

        var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${apikey}`;

        fetch(requestUrl)
            .then(function (response) {
                if(response.status >= 200 && response.status <= 299) {
                    return response.json();
                } else {
                    throw Error(response.statusText);
                }
            })
        .then(function(data) {
            var cityInfo = {
                city: currentCity,
                lon: data.coord.lon,
                lat: data.coord.lat
            }
            return cityInfo;
        })
        .then(function (data) {
            getWeather(data);
        })
    }
    return;
}

displaySearchHist();

searchBtn.on("click",handleCityFormSubmit);
clearBtn.on("click",handleClearHistory);
pastSearchedCityEl.on("click",getPastCity);