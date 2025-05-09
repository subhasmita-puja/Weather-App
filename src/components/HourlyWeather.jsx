import { weatherCodes } from "../constants.js"

const HourlyWeatherItem = ({ hourlyWeather, units, convertTemp }) => {
  // Extract and format temperature and time
  const temperature = Math.floor(hourlyWeather.temp_c)
  const time = hourlyWeather.time.split(" ")[1].substring(0, 5)

  // Find the appropriate weather icon
  const weatherIcon = Object.keys(weatherCodes).find((icon) =>
    weatherCodes[icon].includes(hourlyWeather.condition.code),
  )

  return (
    <li className="weather-item">
      <p className="time">{time}</p>
      <img src={`icons/${weatherIcon}.svg`} className="weather-icon" alt={hourlyWeather.condition.text} />
      <p className="temperature">
        {convertTemp(temperature)}°{units}
      </p>
    </li>
  )
}

export default HourlyWeatherItem
