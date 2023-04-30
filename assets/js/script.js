const apiKey = "";

let queryURL = "http://api.openweathermap.org/data/2.5/weather?";

let localStorageData = JSON.parse(localStorage.getItem("recentCitiesData"));

let latInfo;
let lonInfo;

let timeOfReadNextDay;

let data;
//TODO: Need to render to the page top 10 latest saved cities

function storeCityAddBtn(cityNameInput) {
  //storing into object city details and date added
  //TODO: Need to check if already exist
  //TODO: if exists, need to replace
  //TODO: can I make it a separate function?
  let cityDetails = {
    cityNameStorage: cityNameInput,
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
    .text(cityNameInput);

  $(".btn-group-vertical").append(newBtnCity);
  //TODO: add even listener for all the buttons on the page to display data for that city

  //TODO: retrieve and render 5-day forecast to the page
}



async function renderFiveDays() {
  //adding lat and lon to the forecast url to get 5 day forecast
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
  console.log("Next day (in 5 day forecast function): " + timeOfReadNextDay);

}


async function checkWeather(cityInput) {
  $("#current-city").text("");

  const response = await fetch(
    queryURL + "q=" + cityInput + "&units=imperial&appid=" + apiKey
  );
  data = await response.json();

  //checking if errors with city entry
  if (
    data.cod === "404" ||
    data.cod === "401" ||
    data.cod === "500" ||
    data.cod === "400"
  ) {
    alert("Invalid city name");
  }

  console.log(data);

  //extracting latitude and longitude info to use for 5 day forecast
  latInfo = data.coord.lat;
  lonInfo = data.coord.lon;

  //getting necessary data to display the latest weather
  let cityName = data.name;
  let countryName = data.sys.country;
  let temp = Math.round(data.main.temp);
  let humidity = data.main.humidity;
  let wind = data.wind.speed;
  let timeOfRead = dayjs((data.dt + data.timezone) * 1000).format(
    "MMM DD, YYYY [at] HH:mm"
  );

  timeOfReadNextDay = dayjs((data.dt + data.timezone) * 1000)
    .add(1, "day")
    .startOf("day")
    .format("YYYY-MM-DD HH:mm:ss");

  console.log("Next day: " + timeOfReadNextDay);

  //rendering today's weather to the webpage
  //TODO: need to add icon for the weather
  const cityDate = $("<h2>")
    .text(cityName + ", " + countryName)
    .addClass("fs-4");

  const readTime = $("<p>").text("(Last read local time: " + timeOfRead + ")");

  const tempToDisplay = $("<p>").text("Temperature: " + temp + "°F");
  const humidityToDisplay = $("<p>").text("Humidity: " + humidity + "%");
  const windToDisplay = $("<p>").text("Wind: " + wind + " MPH");

  $("#current-city").append(
    cityDate,
    readTime,
    tempToDisplay,
    humidityToDisplay,
    windToDisplay
  );
  
  storeCityAddBtn(cityName);
  renderFiveDays();

}

$("#search-btn").on("click", function (e) {
  e.preventDefault(e);
  checkWeather($("#search-input").val());
});

