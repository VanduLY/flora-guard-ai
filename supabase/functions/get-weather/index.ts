import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation
function validateCoordinates(latitude: unknown, longitude: unknown): { valid: boolean; error?: string; lat?: number; lon?: number } {
  if (latitude === undefined || longitude === undefined) {
    return { valid: false, error: 'Latitude and longitude are required' };
  }
  
  const lat = Number(latitude);
  const lon = Number(longitude);
  
  if (isNaN(lat) || isNaN(lon)) {
    return { valid: false, error: 'Latitude and longitude must be valid numbers' };
  }
  
  if (lat < -90 || lat > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }
  
  if (lon < -180 || lon > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }
  
  return { valid: true, lat, lon };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { latitude, longitude } = body;

    // Validate inputs
    const validation = validateCoordinates(latitude, longitude);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { lat, lon } = validation;

    const apiKey = Deno.env.get('OPENWEATHERMAP_API_KEY');
    if (!apiKey) {
      console.error('OpenWeatherMap API key not found - using demo data');
      return new Response(
        JSON.stringify(generateDemoWeather(lat!, lon!)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch current weather
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const currentWeatherResponse = await fetch(currentWeatherUrl);
    
    if (!currentWeatherResponse.ok) {
      const errorText = await currentWeatherResponse.text();
      console.error('OpenWeatherMap API error:', errorText);
      
      // Return demo data on API failure
      return new Response(
        JSON.stringify(generateDemoWeather(lat!, lon!)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentWeather = await currentWeatherResponse.json();

    // Fetch forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const forecastResponse = await fetch(forecastUrl);
    const forecast = forecastResponse.ok ? await forecastResponse.json() : null;

    // Process weather data and generate plant care recommendations
    const weatherData = {
      temperature: Math.round(currentWeather.main.temp),
      condition: currentWeather.weather[0].main,
      description: currentWeather.weather[0].description,
      humidity: currentWeather.main.humidity,
      windSpeed: Math.round(currentWeather.wind.speed * 3.6), // Convert m/s to km/h
      icon: currentWeather.weather[0].icon,
      location: currentWeather.name,
      alerts: generatePlantAlerts(currentWeather),
      careTips: generateCareTips(currentWeather),
      forecast: forecast ? processForecast(forecast) : null,
    };

    return new Response(
      JSON.stringify(weatherData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-weather function:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while fetching weather data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generatePlantAlerts(weather: any) {
  const alerts = [];
  
  // High humidity alert
  if (weather.main.humidity > 70) {
    alerts.push({
      type: 'High Humidity',
      message: 'Increased risk of fungal diseases. Ensure good air circulation.',
      severity: weather.main.humidity > 85 ? 'high' : 'medium',
    });
  }

  // Temperature alerts
  if (weather.main.temp > 32) {
    alerts.push({
      type: 'Heat Stress',
      message: 'High temperatures may stress plants. Increase watering frequency.',
      severity: 'high',
    });
  } else if (weather.main.temp < 5) {
    alerts.push({
      type: 'Cold Warning',
      message: 'Low temperatures may damage sensitive plants. Consider protection.',
      severity: 'high',
    });
  }

  // Rain/storm alerts
  if (weather.weather[0].main === 'Rain' || weather.weather[0].main === 'Thunderstorm') {
    alerts.push({
      type: 'Rainfall Alert',
      message: 'Natural watering occurring. Skip manual watering today.',
      severity: 'low',
    });
  }

  // Drought conditions
  if (weather.main.humidity < 30 && weather.weather[0].main === 'Clear') {
    alerts.push({
      type: 'Dry Conditions',
      message: 'Low humidity and no rain. Monitor soil moisture closely.',
      severity: 'medium',
    });
  }

  return alerts;
}

function generateCareTips(weather: any) {
  const tips = [];
  
  // Watering tips
  if (weather.main.temp > 25) {
    tips.push({
      icon: 'droplet',
      message: 'Morning watering recommended due to high afternoon temperatures',
    });
  } else if (weather.weather[0].main === 'Rain') {
    tips.push({
      icon: 'cloud-rain',
      message: 'Skip watering today - natural rainfall is sufficient',
    });
  }

  // Air circulation
  if (weather.main.humidity > 65) {
    tips.push({
      icon: 'wind',
      message: 'Ensure good air circulation to prevent fungal growth',
    });
  }

  // Sunlight management
  if (weather.main.temp > 30 && weather.weather[0].main === 'Clear') {
    tips.push({
      icon: 'sun',
      message: 'Consider providing shade during peak afternoon hours',
    });
  }

  // Default tip if no specific conditions
  if (tips.length === 0) {
    tips.push({
      icon: 'leaf',
      message: 'Good conditions for plant growth. Maintain regular care routine',
    });
  }

  return tips;
}

function processForecast(forecast: any) {
  // Get next 24 hours (8 x 3-hour intervals)
  const next24Hours = forecast.list.slice(0, 8).map((item: any) => ({
    time: new Date(item.dt * 1000).getHours(),
    temp: Math.round(item.main.temp),
    condition: item.weather[0].main,
    icon: item.weather[0].icon,
  }));

  // Get 5-day forecast (daily summaries)
  const dailyForecast: any[] = [];
  const dayMap = new Map<string, any[]>();
  
  forecast.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!dayMap.has(date)) {
      dayMap.set(date, []);
    }
    dayMap.get(date)?.push(item);
  });

  let dayCount = 0;
  dayMap.forEach((items, date) => {
    if (dayCount >= 5) return;
    
    const temps = items.map((i: any) => i.main.temp);
    const minTemp = Math.round(Math.min(...temps));
    const maxTemp = Math.round(Math.max(...temps));
    
    // Get most common condition
    const conditions = items.map((i: any) => i.weather[0].main);
    const conditionCount = conditions.reduce((acc: any, c: string) => {
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {});
    const mainCondition = Object.keys(conditionCount).reduce((a, b) => 
      conditionCount[a] > conditionCount[b] ? a : b
    );
    
    const midItem = items[Math.floor(items.length / 2)];
    
    dailyForecast.push({
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      minTemp,
      maxTemp,
      condition: mainCondition,
      icon: midItem.weather[0].icon,
      humidity: Math.round(items.reduce((acc: number, i: any) => acc + i.main.humidity, 0) / items.length),
    });
    
    dayCount++;
  });

  return { hourly: next24Hours, daily: dailyForecast };
}

function generateDemoWeather(latitude: number, longitude: number) {
  const demoConditions = [
    { main: 'Clear', description: 'clear sky', icon: '01d' },
    { main: 'Clouds', description: 'few clouds', icon: '02d' },
    { main: 'Rain', description: 'light rain', icon: '10d' },
  ];
  
  const randomCondition = demoConditions[Math.floor(Math.random() * demoConditions.length)];
  const baseTemp = 20 + Math.floor(Math.random() * 15); // 20-35°C
  const humidity = 40 + Math.floor(Math.random() * 40); // 40-80%
  
  const demoWeather = {
    main: {
      temp: baseTemp,
      humidity: humidity,
    },
    weather: [{
      main: randomCondition.main,
      description: randomCondition.description,
      icon: randomCondition.icon,
    }],
    wind: {
      speed: 2 + Math.random() * 5, // 2-7 m/s
    },
    name: 'Demo Location',
  };

  return {
    temperature: Math.round(demoWeather.main.temp),
    condition: demoWeather.weather[0].main,
    description: demoWeather.weather[0].description + ' (demo data)',
    humidity: demoWeather.main.humidity,
    windSpeed: Math.round(demoWeather.wind.speed * 3.6),
    icon: demoWeather.weather[0].icon,
    location: `Demo (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
    alerts: generatePlantAlerts(demoWeather),
    careTips: generateCareTips(demoWeather),
    forecast: null,
    isDemo: true,
  };
}
