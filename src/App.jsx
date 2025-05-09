"use client"

import { useEffect, useRef, useState } from "react"
import SearchSection from "./components/SearchSection.jsx"
import CurrentWeather from "./components/CurrentWeather.jsx"
import HourlyWeatherItem from "./components/HourlyWeather.jsx"
import NoResultsDiv from "./components/NoResultsDiv.jsx"
import { weatherCodes } from "./constants.js"

const App = () => {
  const [currentWeather, setCurrentWeather] = useState({})
  const [hourlyForecasts, setHourlyForecasts] = useState([])
  const [hasNoResults, setHasNoResults] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [theme, setTheme] = useState("dark") // dark or light
  const [units, setUnits] = useState("C") // C or F
  const [weatherDetails, setWeatherDetails] = useState(null)
  const searchInputRef = useRef(null)

  // Hardcoded API key - replace this with your actual API key
  const API_KEY = "72acadb2b4184f81851133021250905"

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleUnits = () => {
    setUnits(units === "C" ? "F" : "C")
  }

  const convertTemp = (temp) => {
    if (units === "F") {
      return Math.round((temp * 9) / 5 + 32)
    }
    return temp
  }

  const filterHourlyForecast = (hourlyData) => {
    const currentHour = new Date().setMinutes(0, 0, 0)
    const next24Hours = currentHour + 24 * 60 * 60 * 1000
    // Filter the hourly data to only include the next 24 hours
    const next24HoursData = hourlyData.filter(({ time }) => {
      const forecastTime = new Date(time).getTime()
      return forecastTime >= currentHour && forecastTime <= next24Hours
    })
    setHourlyForecasts(next24HoursData)
  }

  // Fetches weather details based on the API URL
  const getWeatherDetails = async (API_URL) => {
    setIsLoading(true)
    setHasNoResults(false)
    window.innerWidth <= 768 && searchInputRef.current?.blur()

    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error()
      const data = await response.json()

      // Extract current weather data
      const temperature = Math.floor(data.current.temp_c)
      const description = data.current.condition.text
      const weatherIcon = Object.keys(weatherCodes).find((icon) =>
        weatherCodes[icon].includes(data.current.condition.code),
      )

      setCurrentWeather({ temperature, description, weatherIcon })
      setWeatherDetails({
        location: data.location.name,
        country: data.location.country,
        feelsLike: Math.floor(data.current.feelslike_c),
        humidity: data.current.humidity,
        windSpeed: data.current.wind_kph,
        pressure: data.current.pressure_mb,
        uv: data.current.uv,
        visibility: data.current.vis_km,
        lastUpdated: data.current.last_updated,
      })

      // Combine hourly data from both forecast days
      const combinedHourlyData = [...data.forecast.forecastday[0].hour, ...data.forecast.forecastday[1].hour]
      if (searchInputRef.current) {
        searchInputRef.current.value = data.location.name
      }
      filterHourlyForecast(combinedHourlyData)
    } catch (error) {
      // Set hasNoResults state if there's an error
      setHasNoResults(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch default city (London) weather data on initial render
  useEffect(() => {
    const defaultCity = "London"
    const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${defaultCity}&days=2`
    getWeatherDetails(API_URL)
  }, [])

  return (
    <div className={`app-container ${theme}`}>
      <div className="container">
        <div className="app-header">
          <button className="theme-toggle" onClick={toggleTheme}>
            <span className="material-symbols-rounded">{theme === "dark" ? "light_mode" : "dark_mode"}</span>
          </button>
          <button className="unit-toggle" onClick={toggleUnits}>
            °{units}
          </button>
        </div>

        {/* Search section */}
        <SearchSection getWeatherDetails={getWeatherDetails} searchInputRef={searchInputRef} apiKey={API_KEY} />

        {/* Loading state */}
        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading weather data...</p>
          </div>
        )}

        {/* Conditionally render based on hasNoResults state */}
        {!isLoading && hasNoResults ? (
          <NoResultsDiv />
        ) : (
          !isLoading &&
          weatherDetails && (
            <div className="weather-section">
              {/* Location info */}
              <div className="location-info">
                <h1>{weatherDetails.location}</h1>
                <p>{weatherDetails.country}</p>
                <p className="last-updated">Last updated: {weatherDetails.lastUpdated}</p>
              </div>

              {/* Current weather */}
              <CurrentWeather
                currentWeather={currentWeather}
                units={units}
                convertTemp={convertTemp}
                weatherDetails={weatherDetails}
              />

              {/* Weather details grid */}
              <div className="weather-details-grid">
                <div className="detail-card">
                  <span className="material-symbols-rounded">thermostat</span>
                  <div>
                    <p className="detail-title">Feels Like</p>
                    <p className="detail-value">
                      {convertTemp(weatherDetails.feelsLike)}°{units}
                    </p>
                  </div>
                </div>
                <div className="detail-card">
                  <span className="material-symbols-rounded">humidity_percentage</span>
                  <div>
                    <p className="detail-title">Humidity</p>
                    <p className="detail-value">{weatherDetails.humidity}%</p>
                  </div>
                </div>
                <div className="detail-card">
                  <span className="material-symbols-rounded">air</span>
                  <div>
                    <p className="detail-title">Wind Speed</p>
                    <p className="detail-value">{weatherDetails.windSpeed} km/h</p>
                  </div>
                </div>
                <div className="detail-card">
                  <span className="material-symbols-rounded">compress</span>
                  <div>
                    <p className="detail-title">Pressure</p>
                    <p className="detail-value">{weatherDetails.pressure} mb</p>
                  </div>
                </div>
              </div>

              {/* Hourly weather forecast list */}
              <div className="hourly-forecast">
                <h3 className="forecast-title">Hourly Forecast</h3>
                <ul className="weather-list">
                  {hourlyForecasts.map((hourlyWeather) => (
                    <HourlyWeatherItem
                      key={hourlyWeather.time_epoch}
                      hourlyWeather={hourlyWeather}
                      units={units}
                      convertTemp={convertTemp}
                    />
                  ))}
                </ul>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default App
