const apiKey = "";

let queryURL = "http://api.openweathermap.org/data/2.5/weather?";

let localStorageData = JSON.parse(localStorage.getItem("recentCitiesData"));

let latInfo;
let lonInfo;
let timeOfReadNextDay;

//TODO: Need to render to the page top 10 latest saved cities
function renderButtons() {
  //adding button on the left with new city name
  $(".btn-group-vertical").text("");

  if (localStorageData === null) {
    return;
  } else {
    //localStorageData.sort((a, b) => a.dateTimeStored - b.dateTimeStored);
    //localStorageData.sort();
    console.log(localStorageData);

    let howManyToRender = 0;

    if (localStorageData.length > 10) {
      howManyToRender = 10;
    } else {
      howManyToRender = localStorageData.length;
    }

    for (let i = 0; i < howManyToRender; i++) {
      let cityNameToRender = localStorageData[i].cityNameStorage;
      const newBtnCity = $("<button>")
        .addClass("btn btn-secondary m-2 rounded-3")
        .text(cityNameToRender);
      $(".btn-group-vertical").append(newBtnCity);
    }
  }

  //step 1: clear buttons section
  //step 2: if storage is empty, return
  //step 3: if data in storage, sort from newest to latest
  //step 4: create top 10 buttons
  //step 5: add even listener if button clicked, if clicked, call check weather for that button

  //TODO: add even listener for all the buttons on the page to display data for that city
}

function storeCity(cityNameInput, countryName) {
  //storing into object city details and date added
  //TODO: Need to check if already exist
  //TODO: if exists, need to replace
  //TODO: can I make it a separate function?
  let cityDetails = {
    cityNameStorage: cityNameInput + ", " + countryName,
    dateTimeStored: dayjs().format("M/D/YYYY, H:m:s"),
  };

  //pushing details into local storage data array
  if (localStorageData === null) {
    localStorageData = [];
    localStorageData.unshift(cityDetails);
  } else {
    //TODO:remove any duplicate city from the storage
    localStorageData.unshift(cityDetails);
  }

  //saving local storage data array into localStorage in the browser
  localStorage.setItem("recentCitiesData", JSON.stringify(localStorageData));

  renderButtons();
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

  let indexOfNextDay = 0;
  for (let j = 0; j < dataTwo.list.length; j++) {
    if (dataTwo.list[j].dt_txt === timeOfReadNextDay) {
      indexOfNextDay = j;
    }
  }
  console.log("Found Index: " + indexOfNextDay);
  //clearing container
  const sectionForecast = $("#five-day-forecast");
  sectionForecast.text("");

  //creating container for 5-day forecast
  const headerFiveDay = $("<h3>").text("5-Day Forecast:");
  sectionForecast.append(headerFiveDay);

  const allCards = $("<section>").addClass("row d-flex justify-content-evenly");

  let daysToDisplay = 5;
  for (indexOfNextDay; daysToDisplay > 0; indexOfNextDay = indexOfNextDay + 8) {
    // console.log(dataTwo.list[indexOfNextDay].dt_txt);
    let dateNEW = dataTwo.list[indexOfNextDay].dt_txt.split(" ")[0];
    let reformatedDate = dayjs(dateNEW).format("MMM DD, YYYY");
    // console.log(reformatedDate);

    let tempForecast = dataTwo.list[indexOfNextDay].main.temp;
    let windForecast = dataTwo.list[indexOfNextDay].wind.speed;
    let humidityForecast = dataTwo.list[indexOfNextDay].main.humidity;

    //adding all info to the page
    const cardDiv = $("<div>").addClass(
      "mb-3 col-12 col-md-6 col-lg-2 flex-fill"
    );
    const actualCard = $("<div>").addClass("card");
    const cardDate = $("<div>").addClass("card-header").text(reformatedDate);

    const cardBody = $("<div>")
      .addClass("card-body");
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
  }

  // console.log(data);

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

  storeCity(cityName, countryName);
  renderFiveDays();
}

renderButtons();

$("#search-btn").on("click", function (e) {
  e.preventDefault(e);
  checkWeather($("#search-input").val());
});

$("#clear-history").on("click", function (e) {
  e.preventDefault(e);
  localStorage.clear();
  location.reload();
});

$(".btn-group-vertical").on("click", function (e) {
  e.preventDefault(e);
  let cityClicked = e.target.innerHTML;
  console.log(cityClicked);
  checkWeather(cityClicked);
});
