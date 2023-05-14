const apiKey = "d6f32eadc26bfa1d1789657fa842360d";

let queryURL = "https://api.openweathermap.org/data/2.5/weather?";

let foundDuplication = false;
let timeOfReadNextDay;

//function to render buttons to the page from storage
function renderButtons() {
  //clearing buttons section
  $(".btn-group-vertical").text("");

  //retrieving data before rendering
  let localStorageDataToRender = JSON.parse(
    localStorage.getItem("recentCitiesData")
  );
  //checking if anything was stored to local storage yet
  if (localStorageDataToRender === null) {
    return;
  } else {
    //console.log(localStorageData);
    let howManyToRender = 0;
    if (localStorageDataToRender.length > 10) {
      howManyToRender = 10;
    } else {
      howManyToRender = localStorageDataToRender.length;
    }

    //rendering to the page latest 10 cities from local storage
    for (let i = 0; i < howManyToRender; i++) {
      let cityNameToRender = localStorageDataToRender[i].cityNameStorage;
      const newBtnCity = $("<button>")
        .addClass("btn btn-secondary m-2 rounded-3")
        .text(cityNameToRender);
      $(".btn-group-vertical").append(newBtnCity);
    }
  }
}

//function to store city/country to local storage
function storeCity(cityNameInput, countryName) {
  //storing into object city details and date added
  let cityDetails = {
    cityNameStorage: cityNameInput + ", " + countryName,
    dateTimeStored: dayjs().format("M/D/YYYY, H:m:s"),
  };

  //retrieving data before storing
  let localStorageData = JSON.parse(localStorage.getItem("recentCitiesData"));

  //pushing details into local storage data array
  if (localStorageData === null) {
    localStorageData = [];
    localStorageData.unshift(cityDetails);
    localStorage.setItem("recentCitiesData", JSON.stringify(localStorageData));
  } else {
    let updatedLocalStorageData;
    //checking for duplication within local storage
    for (let k = 0; k < localStorageData.length; k++) {
      if (localStorageData[k].cityNameStorage === cityDetails.cityNameStorage) {
        updatedLocalStorageData = localStorageData.slice(k, 1);
        foundDuplication = true;
      }
    }
    if (foundDuplication) {
      updatedLocalStorageData.unshift(cityDetails);
    } else {
      localStorageData.unshift(cityDetails);
      localStorage.setItem(
        "recentCitiesData",
        JSON.stringify(localStorageData)
      );
    }

    foundDuplication = false;
    localStorageData.unshift(cityDetails);
  }

  //calling function to update recent search buttons
  renderButtons();
}

//function to get weather icon based on weather ID
function checkForIcon(iconID) {
  switch (true) {
    //Thunderstorm
    case iconID >= 200 && iconID <= 232:
      return "🌩️";
      break;
    //Drizzle
    case iconID >= 300 && iconID <= 321:
      return "🌦️";
      break;
    //Rain
    case iconID >= 500 && iconID <= 531:
      return "🌧️";
      break;
    //Snow
    case iconID >= 600 && iconID <= 622:
      return "❄️";
      break;
    //Atmosphere
    case iconID >= 701 && iconID <= 781:
      return "🌫️";
      break;
    //Few clouds
    case iconID === 801:
      return "⛅";
      break;
    //Other clouds
    case iconID >= 802 && iconID <= 804:
      return "☁️";
      break;
    default:
      return "☀️";
  }
}

//function to check the weather for 5 days and render to the page
async function renderFiveDays(latInfoPassed, lonInfoPassed) {
  //adding lat and lon to the forecast url to get 5 day forecast
  let getForecastURL =
    "https://api.openweathermap.org/data/2.5/forecast?lat=" +
    latInfoPassed +
    "&lon=" +
    lonInfoPassed +
    "&units=imperial&appid=" +
    apiKey;

  const responseTwo = await fetch(getForecastURL);
  let dataTwo = await responseTwo.json();

  console.log(dataTwo);

  let indexOfNextDay = 0;
  for (let j = 0; j < dataTwo.list.length; j++) {
    if (dataTwo.list[j].dt_txt === timeOfReadNextDay) {
      indexOfNextDay = j;
    }
  }

  //clearing container
  const sectionForecast = $("#five-day-forecast");
  sectionForecast.text("");

  //creating container for 5-day forecast
  const headerFiveDay = $("<h3>");
  sectionForecast.append(headerFiveDay);

  let daysToDisplay;

  //checking initial reading is just after midnight, can only see forecast for next 4 days
  if (indexOfNextDay === 8) {
    daysToDisplay = 4;
    headerFiveDay.text(
      "4-Day Forecast (currently available due to local time of the read):"
    );
  } else {
    daysToDisplay = 5;
    headerFiveDay.text("5-Day Forecast:");
  }

  sectionForecast.append(headerFiveDay);

  const allCards = $("<section>").addClass("row d-flex justify-content-evenly");

  for (indexOfNextDay; daysToDisplay > 0; indexOfNextDay = indexOfNextDay + 8) {
    //retrieving all the data received from weather api
    let dateNEW = dataTwo.list[indexOfNextDay].dt_txt.split(" ")[0];
    let reformatedDate = dayjs(dateNEW).format("MMM DD, YYYY");

    let tempForecast = Math.round(dataTwo.list[indexOfNextDay].main.temp);
    let windForecast = dataTwo.list[indexOfNextDay].wind.speed;
    let humidityForecast = dataTwo.list[indexOfNextDay].main.humidity;

    let weatherIconForecastID = dataTwo.list[indexOfNextDay].weather[0].id;
    let weatherForecastIcon = checkForIcon(weatherIconForecastID);

    //adding all info to the page
    const cardDiv = $("<div>").addClass(
      "mb-3 col-12 col-md-6 col-lg-2 flex-fill"
    );
    const actualCard = $("<div>").addClass("card");
    const cardDate = $("<div>")
      .addClass("card-header")
      .text(reformatedDate + " " + weatherForecastIcon);

    const cardBody = $("<div>").addClass("card-body");
    const tempForecastToDisplay = $("<p>").text(
      "Temperature: " + tempForecast + "°F"
    );
    const humidityForecastToDisplay = $("<p>").text(
      "Humidity: " + humidityForecast + "%"
    );
    const windFOrecastToDisplay = $("<p>").text(
      "Wind: " + windForecast + " MPH"
    );
    cardBody.append(
      tempForecastToDisplay,
      humidityForecastToDisplay,
      windFOrecastToDisplay
    );
    actualCard.append(cardDate, cardBody);
    cardDiv.append(actualCard);
    allCards.append(cardDiv);

    daysToDisplay--;
  }
  sectionForecast.append(allCards);
}

//function to check the weather and render to the page
async function checkWeather(cityInput) {
  $("#current-city").text("");

  const response = await fetch(
    queryURL + "q=" + cityInput + "&units=imperial&appid=" + apiKey
  );
  let data = await response.json();

  //checking if errors with city entry
  if (
    data.cod === "404" ||
    data.cod === "401" ||
    data.cod === "500" ||
    data.cod === "400"
  ) {
    alert("Invalid city name");
    location.reload();
  }

  //console.log(data);

  //extracting latitude and longitude info to use for 5 day forecast
  let latInfo = data.coord.lat;
  let lonInfo = data.coord.lon;

  //getting necessary data to display the latest weather
  let cityName = data.name;
  let countryName = data.sys.country;
  let temp = Math.round(data.main.temp);
  let humidity = data.main.humidity;
  let wind = data.wind.speed;
  let timeOfRead = dayjs((data.dt + data.timezone) * 1000).format(
    "MMM DD, YYYY [at] HH:mm a"
  );
  let mainWeather = data.weather[0].main;

  let weatherIconID = data.weather[0].id;
  let weatherIcon = checkForIcon(weatherIconID);

  //calculating what would be the next day at 12am
  timeOfReadNextDay = dayjs((data.dt + data.timezone) * 1000)
    .add(1, "day")
    .startOf("day")
    .format("YYYY-MM-DD HH:mm:ss");
    
//   timeOfReadNextDay = dayjs((data.dt + data.timezone) * 1000)
//     .add(1, "day")
//     .format("YYYY-MM-DD");

//     timeOfReadNextDay = timeOfReadNextDay + " 12:00:00";
// console.log(timeOfReadNextDay);

  //rendering today's weather to the webpage
  const cityDate = $("<h2>")
    .text(
      cityName +
        ", " +
        countryName +
        " " +
        weatherIcon +
        " (" +
        mainWeather +
        ")"
    )
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

  renderFiveDays(latInfo, lonInfo);
  storeCity(cityName, countryName);
}

//rendering search buttons from local storage on page load
renderButtons();

//event listener for Search form
$("#search-form").on("submit", function (e) {
  e.preventDefault(e);
  let cityInput = $("#search-input").val();
  $("#search-input").val("");
  checkWeather(cityInput);
});

//event listener for Clear search history button
$("#clear-history").on("click", function (e) {
  e.preventDefault(e);
  localStorage.clear();
  location.reload();
});

//event listener for any buttons from search history
$(".btn-group-vertical").on("click", ".btn", function (e) {
  e.preventDefault(e);
  let cityClicked = e.target.innerHTML;
  checkWeather(cityClicked);
});
