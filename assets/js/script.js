const apiKey = "";
let todaysDate = dayjs().format("M/D/YYYY"); 

let queryURL = "http://api.openweathermap.org/data/2.5/weather?";

let localStorageData = JSON.parse(localStorage.getItem("recentCitiesData"));

//TODO: Need to render to the page top 10 latest saved cities

async function checkWeather(cityInput) {
  $("#current-city").text("");

  //getting latitude and longitude info by city name
  const response = await fetch(
    queryURL + "q=" + cityInput + "&appid=" + apiKey
  );
  let data = await response.json();

  let latInfo = data.coord.lat;
  let lonInfo = data.coord.lon;

  //adding lat and lon to the forecast url to get full forecast
  let getForecastURL =
    "http://api.openweathermap.org/data/2.5/forecast?lat=" +
    latInfo +
    "&lon=" +
    lonInfo +
    "&units=imperial&appid=" +
    apiKey;

  const responseTwo = await fetch(getForecastURL);
  let dataTwo = await responseTwo.json();

  // console.log(dataTwo);

  //getting necessary data to display today's weather
  let cityName = dataTwo.city.name;
  let temp = Math.round(dataTwo.list[0].main.temp);
  let humidity = dataTwo.list[0].main.humidity;
  let wind = dataTwo.list[0].wind.speed;

  //rendering today's weather to the webpage
  //TODO: need to add icon for the weather. What data field to use?
  const cityDate = $("<h2>")
    .text(cityName + " (" + todaysDate + ")")
    .addClass("fs-4");

  const tempToDisplay = $("<p>").text("Temperature: " + temp + "°F");
  const humidityToDisplay = $("<p>").text("Humidity: " + humidity + "%");
  const windToDisplay = $("<p>").text("Wind: " + wind + " MPH");

  $("#current-city").append(
    cityDate,
    tempToDisplay,
    humidityToDisplay,
    windToDisplay
  );

  //storing into object city details and date added
  //TODO: Need to check if already exist
  //TODO: if exists, need to replace
  //TODO: can I make it a separate function?
  let cityDetails = {
    cityNameStorage: cityName,
    dateTimeStored: dayjs().format("M/D/YYYY, H:m:s"),
  };

  //pushing details into local storage data array
  if (localStorageData === null) {
    localStorageData = [];
    localStorageData.push(cityDetails);
  } else {
    localStorageData.push(cityDetails);
  }

  //saving local storage data array into localStorage in the browser
  localStorage.setItem("recentCitiesData", JSON.stringify(localStorageData));

  //adding button on the left with new city name
  //TODO: Need to check if already exist OR rerender from the storage
  const newBtnCity = $("<button>")
    .addClass("btn btn-secondary m-2 rounded-3")
    .text(cityName);

  $(".btn-group-vertical").append(newBtnCity);
//TODO: add even listener for all the buttons on the page to display data for that city

//TODO: retrieve and render 5-day forecast to the page



}

$("#search-btn").on("click", function() {
  checkWeather($("#search-input").val());
})


