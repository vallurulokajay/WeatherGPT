import os
import requests
from dotenv import load_dotenv

load_dotenv()

CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"
FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"


def _get_api_key() -> str:
    key = os.getenv("WEATHER_API_KEY")
    if not key:
        raise RuntimeError("WEATHER_API_KEY is not configured. Please set it in backend/.env")
    return key


def get_current_weather(latitude: float, longitude: float):
    api_key = _get_api_key()
    params = {
        "lat": latitude,
        "lon": longitude,
        "appid": api_key,
        "units": "metric"
    }

    response = requests.get(
        CURRENT_URL,
        params=params,
        timeout=10
    )

    response.raise_for_status()
    data = response.json()

    return {
        "location": data.get("name", "Unknown location"),
        "temperature": data["main"]["temp"],
        "feels_like": data["main"]["feels_like"],
        "humidity": data["main"]["humidity"],
        "pressure": data["main"]["pressure"],
        "wind_speed": data["wind"]["speed"],
        "condition": data["weather"][0]["description"]
    }


def get_current_weather_by_city(city: str):
    api_key = _get_api_key()
    params = {
        "q": city,
        "appid": api_key,
        "units": "metric"
    }

    response = requests.get(
        CURRENT_URL,
        params=params,
        timeout=10
    )

    response.raise_for_status()
    data = response.json()

    return {
        "location": data.get("name", city),
        "temperature": data["main"]["temp"],
        "feels_like": data["main"]["feels_like"],
        "humidity": data["main"]["humidity"],
        "pressure": data["main"]["pressure"],
        "wind_speed": data["wind"]["speed"],
        "condition": data["weather"][0]["description"]
    }


def get_forecast(latitude: float, longitude: float):
    api_key = _get_api_key()
    params = {
        "lat": latitude,
        "lon": longitude,
        "appid": api_key,
        "units": "metric"
    }

    response = requests.get(
        FORECAST_URL,
        params=params,
        timeout=10
    )

    response.raise_for_status()
    data = response.json()

    forecast = []
    for item in data.get("list", []):
        forecast.append({
            "datetime": item["dt_txt"],
            "temperature": item["main"]["temp"],
            "feels_like": item["main"]["feels_like"],
            "humidity": item["main"]["humidity"],
            "pressure": item["main"]["pressure"],
            "wind_speed": item["wind"]["speed"],
            "condition": item["weather"][0]["description"],
            "rain_probability": item.get("pop", 0) * 100
        })

    return {
        "location": data.get("city", {}).get("name", "Unknown location"),
        "forecast": forecast
    }


def get_forecast_by_city(city: str):
    api_key = _get_api_key()
    params = {
        "q": city,
        "appid": api_key,
        "units": "metric"
    }

    response = requests.get(
        FORECAST_URL,
        params=params,
        timeout=10
    )

    response.raise_for_status()
    data = response.json()

    forecast = []
    for item in data.get("list", []):
        forecast.append({
            "datetime": item["dt_txt"],
            "temperature": item["main"]["temp"],
            "feels_like": item["main"]["feels_like"],
            "humidity": item["main"]["humidity"],
            "pressure": item["main"]["pressure"],
            "wind_speed": item["wind"]["speed"],
            "condition": item["weather"][0]["description"],
            "rain_probability": item.get("pop", 0) * 100
        })

    return {
        "location": data.get("city", {}).get("name", city),
        "forecast": forecast
    }