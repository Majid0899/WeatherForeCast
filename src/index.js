const API_KEY = "e62155e758624e4ca64130036251607";

const searchCity = document.querySelector("#citySearch");

const button = document.querySelector("#currentLocation");

/**
 * Fetch the current weather
 * return an object with details
 * Country,Date,Temperature,Wind,Humidity
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

/*Search City Event*/
searchCity.addEventListener("click", addCityData);

/*Add Search City Data */
async function addCityData() {
  const city = document.querySelector("#cityInput").value;

  if (!city) {
    document.querySelector("#inputError").classList.remove("hidden");
  } else {
    document.querySelector("#inputError").classList.add("hidden");

    const data = await fetchCurrentWeather(city);

    renderCurrentData(data);
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
  document.getElementById("location-info").classList.remove("hidden")
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
