
const apiKey = "YOUR_OPENWEATHERMAP_API_KEY" 
const elements = {
  cityInput: document.getElementById('cityInput'),
  searchBtn: document.getElementById('searchBtn'),
  geoBtn: document.getElementById('geoBtn'),
  unitToggle: document.getElementById('unitToggle'),
  weatherSection: document.getElementById('weatherSection'),
  loader: document.getElementById('loader'),
  error: document.getElementById('error'),
  location: document.getElementById('location'),
  desc: document.getElementById('desc'),
  temp: document.getElementById('temp'),
  icon: document.getElementById('icon'),
  feels: document.getElementById('feels'),
  hum: document.getElementById('hum'),
  wind: document.getElementById('wind'),
  hourly: document.getElementById('hourly')
}

let units = 'metric' 

function showLoader(show){
  elements.loader.classList.toggle('hidden', !show)
}
function showError(msg){
  elements.error.textContent = msg
  elements.error.classList.remove('hidden')
}
function hideError(){
  elements.error.classList.add('hidden')
}

async function fetchJSON(url){
  const res = await fetch(url)
  if(!res.ok) throw new Error('Network response was not ok')
  return res.json()
}

async function getWeatherByCity(city){
  hideError(); showLoader(true); elements.weatherSection.classList.add('hidden')
  try{
    
    const w = await fetchJSON(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}`)
   
    const f = await fetchJSON(`https://api.openweathermap.org/data/2.5/forecast?lat=${w.coord.lat}&lon=${w.coord.lon}&appid=${apiKey}&units=${units}`)

    renderWeather(w, f)
  }catch(err){
    console.error(err)
    showError('Could not fetch weather. Check city name or API key.')
  }finally{ showLoader(false) }
}

async function getWeatherByCoords(lat, lon){
  hideError(); showLoader(true); elements.weatherSection.classList.add('hidden')
  try{
    const w = await fetchJSON(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`)
    const f = await fetchJSON(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`)
    renderWeather(w,f)
  }catch(err){
    console.error(err)
    showError('Could not fetch weather for your location.')
  }finally{ showLoader(false) }
}

function renderWeather(current, forecast){
  elements.weatherSection.classList.remove('hidden')
  elements.location.textContent = `${current.name}, ${current.sys.country}`
  elements.desc.textContent = capitalize(current.weather[0].description)
  elements.icon.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`
  elements.icon.alt = current.weather[0].description
  elements.temp.textContent = `${Math.round(current.main.temp)}°${units==='metric'?'C':'F'}`
  elements.feels.textContent = `${Math.round(current.main.feels_like)}°`
  elements.hum.textContent = `${current.main.humidity}%`
  elements.wind.textContent = `${Math.round(current.wind.speed)} ${units==='metric'?'m/s':'mph'}`

  
  elements.hourly.innerHTML = ''
  const next = forecast.list.slice(0, 12)
  next.forEach(item =>{
    const date = new Date(item.dt * 1000)
    const hour = date.getHours()
    const label = formatHour(hour)
    const temp = Math.round(item.main.temp)
    const icon = item.weather[0].icon
    const card = document.createElement('div')
    card.className = 'hourly-card'
    card.innerHTML = `<small>${label}</small><img src="https://openweathermap.org/img/wn/${icon}.png" alt="" style="width:48px"><div style="font-weight:700">${temp}°</div>`
    elements.hourly.appendChild(card)
  })

  
  applyTheme(current.weather[0].main)
}

function applyTheme(main){
  
  const body = document.body
  body.classList.remove('theme-clear','theme-clouds','theme-rain','theme-snow','theme-mist')
  if(main === 'Clear') body.classList.add('theme-clear')
  else if(main === 'Clouds') body.classList.add('theme-clouds')
  else if(['Rain','Drizzle','Thunderstorm'].includ