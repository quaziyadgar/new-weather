const API_KEY = "90a7a54a319f3cb24209a039be3ef186";
const BASE_URL = "https://api.openweathermap.org/data/2.5/";

const getWeatherData = async (endpoint, params) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  params.appid = API_KEY;
  params.units = "metric"; // Celsius
  Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }
  return response.json();
};


const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");

const displayWeather = (data) => {
  document.getElementById("weather-info").innerHTML = `<div class='weather-info'>
    <h2 class="text-2xl font-bold">${data.name}</h2>
    <p>Temperature: ${data.main.temp}°C</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" /></div>
  `;
};

const displayForecast = (data) => {
  const daily = data.list.filter((item) => item.dt_txt.includes("12:00:00"));
  // console.log({ daily })
  const forecastHTML = daily
    .map(
      (day) => `
        <div class="forecast-card">
          <p>${new Date(day.dt * 1000).toDateString()}</p>
          <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" />
          <p>Temp: ${day.main.temp}°C</p>
          <p>Wind: ${day.wind.speed} m/s</p>
          <p>Humidity: ${day.main.humidity}%</p>
        </div>`
    )
    .join("");
  document.getElementById("forecast-info").innerHTML = forecastHTML;
};

const handleCityClick = (val) =>{
  cityInput.value = val;
  searchBtn.click();
}

const showRecentCities = () => {
  // Start with the base HTML
  let cities = "";

  // Iterate over localStorage keys
  Object.keys(localStorage).forEach(function (key) {
    // Append each city as a new div
    const value = localStorage.getItem(key); // Get the value
    if (value) {
      cities += `<div class='city' onclick="handleCityClick('${value}')">${value}</div>`; // Concatenate the string
    }
  });
  // console.log(cities);
  document.getElementById("recent-cities").innerHTML = `<div>Recent Cities<div class='recent-cities'>${cities}</div></div>`;
};


searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) return alert("Please enter a valid city name");
  try {
    localStorage.setItem(city, city);
    const data = await getWeatherData("weather", { q: city });
    displayWeather(data);
    // console.log(data);
    const forecast = await getWeatherData("forecast", data.coord);
    // console.log(forecast);
    displayForecast(forecast);
    showRecentCities();
  } catch (error) {
    alert("City not found!");
  }
});

const currentBtn = document.getElementById("current-btn");

currentBtn.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    try {
      const data = await getWeatherData("weather", {
        lat: coords.latitude,
        lon: coords.longitude,
      });
      displayWeather(data);
      const forecast = await getWeatherData("forecast", data.coord);
      displayForecast(forecast);
      // console.log(forecast);
      showRecentCities();
      cityInput.value = ""
    } catch (error) {
      alert("Unable to fetch current location weather!", error);
    }
  });
});