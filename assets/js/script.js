var cityInputEl = $('#city-input');
var searchBtn = $('#search-button');
var clearBtn = $('#clear-button');
var pastSearchedCityEl = $('#past-searches');
var apiKey = '5e51bd9c5cc145ef9b56e8b0da79d03a'

var currentCity;

function getWeather(data) {

    var requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&appid={API key}`
    fetch(requestUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data){
            var currentConditionsEl = $('#currentConditions');
            currentConditionsEl.addClass('border border-primary');
            
            var cityNameEl = $('<h2>');
            cityNameEl.text(currentCity);
            currentConditionsEl.append(cityNameEl);

            var currentCityDate = data.current.dt;
            currentCityDate = moment.unix(currentCityDate).format("MM/DD/YYYY");

            var currentDateEl = $('<span>');
            currentDateEl.text(`(${currentCityDate})`);
            cityNameEl.append(currentDateEl);

            var CurrentCityWeatherIcon = data.current.weather[0].icon;
            var currentWeatherIconEl = $('<img');
            CurrentCityWeatherIcon.attr("scr", "http://openweathermap.org/img/wn/" + currentCityWeatherIcon + ".png");
            cityNameEl.append(currentWeatherIconEl);

            var currentCityTemp = data.current.temp;
            var currentTempEl = $('<p>');
            currentTempEl.text(`Temp: ${currentCityTemp}°C`)
            currentConditionsEl.append(currentTempEl);

            var currentCityWind = data.current.wind_speed;
            var currentWindEl = $('<p>')
            currentWindEl.text(`Wind: ${currentCityWind} KPH`)
            currentConditionsEl.append(currentWindEl);

            var currentCityHumidity = data.current.humidity;
            var currentHumidityEl = $('<p>')
            currentHumidityEl.text(`Humidity: ${currentCityHumidity}%`)
            currentConditionsEl.append(currentHumidityEl);

            var currentCityUV = data.current.uvi;
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

            currentUvSpanEl.append(currentUvEl);

            //5 day forecast
            // create 5 day forecast <h2> header
            var fiveDayForeHeaderEl = $('#fiveDayForeHeader');
            var fiveDayHeaderEl = $('<h2>');
            fiveDayHeaderEl.text('5 Day Forecast:');
            fiveDayForeHeaderEl.append(fiveDayHeaderEl);

            var fiveDayForecastEl = $('#fiveDayForecast');

            //get key weather info from API data for 5 day forecast

            for (var i = 1; i <= 5; i++) {
                var date;
                var temp;
                var icon;
                var wind;
                var humidity;

                date = data.daily[i].dt;
                date = moment.unix(data).format("MM/DD/YYYY");

                temp = data.daily[i].temp.day;
                icon = data.daily[i].weather[0].icon;
                wind = data.daily[i].wind_speed;
                humidity = data.daily[i].humidity;

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
    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${APIkey}`;
    var storedCities = JSON.parse(local.storage.getItem("cities")) || [];

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

            displaySearchHistory();

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

        var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${APIkey}`;

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