import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import _ from "lodash";

const app = express();
const port = 3000;

const API_URL = "https://api.openweathermap.org/data/2.5/weather?q=";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast?q=";
const yourBearerToken = "1a164eac40d69f7bace4db72fe9f6681";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  const searchTerm = "vijayawada";
  res.redirect(`/${searchTerm}`);
});

app.get("/search", (req, res) => {
  const searchTerm = req.query.searchTerm;
  res.redirect(`/${searchTerm}`);
});


app.get("/:postName", async (req, res) => {
  const requestedTitle = _.startCase(req.params.postName);

  try {
    const result = await axios.get(
      API_URL + requestedTitle + "&appid=" + yourBearerToken
    );
    const forecastresult = await axios.get(
      FORECAST_URL + requestedTitle + "&appid=" + yourBearerToken
    );
    const Weather = result.data;
    
    const sunset = Weather.sys.sunset;
    const sunrise = Weather.sys.sunrise;
    // console.log(sunrise);
   
    const riseTime = new Date(sunrise * 1000).toUTCString();
    const setTime = new Date(sunset * 1000).toUTCString();

    var sunriseIST = new Date(riseTime).toLocaleString(undefined, {timeZone: 'Asia/Kolkata'});
    var sunsetIST = new Date(setTime).toLocaleString(undefined, {timeZone: 'Asia/Kolkata'});
   
    const forecastList = forecastresult.data.list;

    const currentDate = new Date();
    const currentTime = currentDate.getTime();
    // console.log(currentTime);

    const next18Hours = [];
    for (const forecast of forecastList) {
      const forecastTime = forecast.dt * 1000; 

      if (forecastTime >= currentTime && next18Hours.length < 6) {
        next18Hours.push(forecast);
    
      }
    }
    
    res.render("index.ejs", {
      icon: Weather.weather[0]?.icon || 'default-icon',
      temp: Weather.main.temp - 273.15,
      city: Weather.name,
      clouds: Weather.clouds.all,
      main: Weather.weather[0].main,
      description: Weather.weather[0].description,
      lati: Weather.coord.lat,
      long: Weather.coord.lon,
      maxtemp: Weather.main.temp_max - 273.15,
      mintemp: Weather.main.temp_min - 273.15,
      humidity: Weather.main.humidity,
      pressure: Weather.main.pressure,
      wind: (Weather.wind.speed * 3.6).toFixed(2),
      sunrise: sunriseIST,
      sunset: sunsetIST,
      
      next18Hours: next18Hours,
    });
  } catch (error) {
    const errorMessage = 'An error occurred while fetching weather data.';
        res.render('index.ejs', { errorMessage });
  }
});

app.listen(port, () => {
  console.log(`Server is running is running at port ${port}`);
});
