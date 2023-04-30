const apiKey = "378712102260cd514689131e9b23c2c4";
let todaysDate = dayjs().format("M/D/YYYY"); 

let queryURL = "http://api.openweathermap.org/data/2.5/weather?";

let localStorageData = JSON.parse(localStorage.getItem("recentCitiesData"));

async function checkWeather(cityInput) {
  $("#current-city").text("");

  const response = await fetch(
    queryURL + "q=" + cityInput + "&appid=" + apiKey
  );
  let data = await response.json();

  let latInfo = data.coord.lat;
  let lonInfo = data.coord.lon;

  let getForecastURL =
    "http://api.openweathermap.org/data/2.5/forecast?lat=" +
    latInfo +
    "&lon=" +
    lonInfo +
    "&units=imperial&appid=" +
    apiKey;

  const responseTwo = await fetch(getForecastURL);
  let dataTwo = await responseTwo.json();

  console.log(dataTwo);

  let cityName = dataTwo.city.name;
  let temp = Math.round(dataTwo.list[0].main.temp);
  let humidity = dataTwo.list[0].main.humidity;
  let wind = dataTwo.list[0].wind.speed;

  console.log("City: " + cityName);
  console.log("Date: " + todaysDate);
  console.log("Temperature: " + temp + "°F");
  console.log("Humidity: " + humidity + "%");
  console.log("Wind: " + wind + " MPH");

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

  const newBtnCity = $("<button>")
    .addClass("btn btn-secondary m-2 rounded-3")
    .text(cityName);

  $(".btn-group-vertical").append(newBtnCity);

  //storing into object city details and date added
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
}

$("#search-btn").on("click", function() {
  checkWeather($("#search-input").val());
})


