import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude } = await req.json();

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('OPENWEATHERMAP_API_KEY');
    if (!apiKey) {
      console.error('OpenWeatherMap API key not found');
      return new Response(
        JSON.stringify({ error: 'Weather service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch current weather
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
    const currentWeatherResponse = await fetch(currentWeatherUrl);
    
    if (!currentWeatherResponse.ok) {
      console.error('OpenWeatherMap API error:', await currentWeatherResponse.text());
      return new Response(
        JSON.stringify({ error: 'Failed to fetch weather data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentWeather = await currentWeatherResponse.json();

    // Fetch forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
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
      JSON.stringify({ error: 'Internal server error' }),
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

  return next24Hours;
}
