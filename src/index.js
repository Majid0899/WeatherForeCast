const API_KEY = "e62155e758624e4ca64130036251607";

const searchCity = document.querySelector("#citySearch");

const button = document.querySelector("#currentLocation");

let recentSearch = JSON.parse(localStorage.getItem("recentCities")) || [];

let hasAddOption = false;

/**
 * Fetch the current weather
 * return an object with details
 * Country,Date,Temperature,Wind,Humidity,weather condition
 */

async function fetchCurrentWeather(city) {
  const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`;

  try {
    const data = await fetch(url);
    const res = await data.json();

    const country = res.location.country;
    const city = res.location.name;
    const temp = res.current.temp_c;
    const wind = res.current.wind_mph;
    const humidity = res.current.humidity;
    const date = res.location.localtime.split(" ")[0];

    return { country, date, temp, wind, humidity, city };
  } catch (error) {
    console.log("Data not fetched", error);
  }
}

/**
 * Fetch forecast of 5 Days
 * return an object with details
 * Date,Temperature,Wind,Humidity,weather condition
 */

async function fetchForecastWeather(city) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=6&aqi=no&alerts=no`;

  try {
    const data = await fetch(url);
    const res = await data.json();

    const forecasts = res.forecast.forecastday;
    forecasts.shift(0);

    const weather_data = forecasts.map((forecast) => {
      const date = forecast.date;
      const temp = forecast.day.avgtemp_c;
      const wind = forecast.day.maxwind_mph;
      const humidity = forecast.day.avghumidity;
      const condition = forecast.day.condition.text;
      return { date, temp, wind, humidity, condition };
    });
    return weather_data;
  } catch (error) {
    console.log("Data not fetched", error);
  }
}

/*Search City Event*/
searchCity.addEventListener("click", addCityData);

/*Add Search City Data */
async function addCityData() {
  const city = document.querySelector("#cityInput").value.trim();
  if (!validateLocation(city)) {
    document.querySelector("#inputError").classList.remove("hidden");
  } else {
    document.querySelector("#inputError").classList.add("hidden");
    document.querySelector("#location-info").classList.add("hidden");
    document.querySelector("#recentDropdown").classList.remove("hidden");

    //check if city is exist or not
    if (!recentSearch.includes(city)) {
      recentSearch.unshift(city);
    }

    const data = await fetchCurrentWeather(city);

    renderCurrentData(data);
    saveToLocalStorage();

    if (!hasAddOption) {
      addOptions();
      hasAddOption = true;
    }
  }
}

/** SearchCity 5 Days forecast Event */
searchCity.addEventListener("click", addForecastData);

/*Add Forecast city data */
async function addForecastData() {
  console.log("Forecast");
  const city = document.querySelector("#cityInput").value.trim();
  if (!validateLocation(city)) {
    document.querySelector("#inputError").classList.remove("hidden");
  } else {
    document.querySelector("#inputError").classList.add("hidden");

    const data = await fetchForecastWeather(city);

    console.log(data);
    renderForeCastData(data);
  }
}

/* Current Location Event*/
button.addEventListener("click", addCurrentLocation);

/*Add Current Location Data*/
function addCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    document.getElementById("location-info").innerText =
      "Geolocation is not supported by this browser.";
  }
}

/*Drop Down Menu */
const recentCities = document.querySelector("#recentCities");

/*Add options in drop down  */
function addOptions() {
  let count = 1;
  recentSearch.forEach((cities) => {
    if (count > 5) return;
    const option = document.createElement("option");
    option.value = `${cities}`;
    option.innerText = `${cities}`;
    count += 1;
    recentCities.appendChild(option);
  });
}

recentCities.addEventListener("change", addCityDrop);

/*Add current location from drop down*/
async function addCityDrop() {
  const city = this.value;
  const data = await fetchCurrentWeather(city);
  renderCurrentData(data);
}

/** Utility Function */

/*Handle Current Position */
async function showPosition(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  const url = `https://api.weatherapi.com/v1/current.json?key=e62155e758624e4ca64130036251607&q=${latitude},${longitude}&aqi=no`;

  const res = await fetch(url);
  const response = await res.json();

  const data = {
    city: response.location.name,
    country: response.location.country,
    temp: response.current.temp_c,
    wind: response.current.wind_kph,
    humidity: response.current.humidity,
    date: response.location.localtime.split(" ")[0],
  };

  renderCurrentData(data);
}

/* Handle Current Position Error*/
function showError(error) {
  let message = "";
  switch (error.code) {
    case error.PERMISSION_DENIED:
      message = "User denied the request for Geolocation.";
      break;
    case error.POSITION_UNAVAILABLE:
      message = "Location information is unavailable.";
      break;
    case error.TIMEOUT:
      message = "The request to get user location timed out.";
      break;
    case error.UNKNOWN_ERROR:
      message = "An unknown error occurred.";
      break;
  }
  document.getElementById("location-info").innerHTML = "Error: " + message;
  document.getElementById("location-info").classList.remove("hidden");
}

/* Render Data in Current Weather Dashboard */
function renderCurrentData(data) {
  // CityName
  document.querySelector(
    "#cityName"
  ).innerHTML = `${data.city}<h1 class="text-2xl font-bold pl-1">(${data.country})</h1>`;
  // Date
  document.querySelector("#currentDate").innerText = data.date;

  // Temperature
  document.querySelector("#temperature").innerText = `${data.temp} °C`;

  // Wind
  document.querySelector("#windSpeed").innerText = `${data.wind} m/h`;

  // Humidity
  document.querySelector("#humidity").innerText = `${data.humidity} %`;
}

/*Render Forecast in weather Dasboard */
function renderForeCastData(forecasts) {
  let cards = document.querySelector("#forecastCards");

  console.log(cards);
  cards.innerText = "";

  

  forecasts.forEach((forecast) => {
    const card = document.createElement("div");
    card.classList.add("bg-gray-200", "rounded-lg", "hover:animate-wiggle");
    card.innerHTML = `
  
    <!-- Weather Forecast Card  Start-->
              <!-- Date -->
              <div class="mt-2 text-gray-700">
                <h2 class="px-2 text-2xl font-bold">${forecast.date}</h2>
              </div>
              <!-- Date End -->

              <!-- Temperature Start -->
              <div class="mt-2 text-blue-800 hover:animate-bounce flex lg:pr-3">
                <p class="font-semibold pt-1 pl-1.5">Temperature</p>
                <p
                  id="foreCasttemperature"
                  class="flex text-xl pt-1 pl-1.5 pb-1 lg:p-0"
                >
                  ${forecast.temp} °C
                  <img
                    id="forecasttemperatureIcon"
                    src="../images/temperature.png"
                    alt="Weather Icon"
                    class="w-10 h-8 mb-1.5 pl-1"
                  />
                </p>
              </div>
              <!-- Wind start  -->
              <div
                class="mt-2 text-yellow-600 hover:animate-bounce flex lg:pr-3"
              >
                <p class="font-semibold pt-1 pl-1.5">Wind Speed</p>
                <p id="forecastwindSpeed" class="flex text-xl pt-1 pl-1.5 pb-1">
                  ${forecast.wind} m/s
                  <img
                    id="forecastwindIcon"
                    src="../images/wind.png"
                    alt="Weather Icon"
                    class="w-10 h-8 mb-1.5 pl-1"
                  />
                </p>
              </div>
              <!-- Wind End -->
              <!-- Humidity Start-->
              <div class="mt-2 text-green-900 hover:animate-bounce px-2 flex">
                <p class="font-semibold pt-1 pl-1">Humidity</p>
                <p id="forecasthumidity" class="flex text-xl pt-1 pb-1 pl-1">
                  ${forecast.humidity} %
                  <img
                    id="forecasthumidity"
                    src="../images/humidity.png"
                    alt="Weather Icon"
                    class="w-10 h-8 mb-1.5 pl-1"
                  />
                </p>
              </div>
              <!-- Humidity End -->
           
            <!-- Weather Forecast Card End -->
`;
    cards.append(card);
  });
}

/*Validate the City */
function validateLocation(location) {
  const locationRegex = /^[a-zA-Z\s]+$/;
  if (!location.trim()) {
    document.querySelector("#inputError").innerText = "City cannot be empty.";
    return false;
  }
  if (!locationRegex.test(location)) {
    document.querySelector("#inputError").innerText =
      "Invalid City. Only letters and spaces are allowed.";
    return false;
  }
  return true;
}

/*Saves to Local Storge */
function saveToLocalStorage() {
  localStorage.setItem("recentCities", JSON.stringify(recentSearch));
}
