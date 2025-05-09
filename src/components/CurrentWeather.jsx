const CurrentWeather = ({ currentWeather, units, convertTemp, weatherDetails }) => {
  return (
    <div className="current-weather">
      <div className="weather-main">
        <img
          src={`icons/${currentWeather.weatherIcon}.svg`}
          className="weather-icon"
          alt={currentWeather.description}
        />
        <div className="temp-container">
          <h2 className="temperature">
            {convertTemp(currentWeather.temperature)}
            <span>°{units}</span>
          </h2>
          <p className="description">{currentWeather.description}</p>
        </div>
      </div>
    </div>
  )
}

export default CurrentWeather
