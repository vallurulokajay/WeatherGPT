from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from weather import (
    get_current_weather,
    get_forecast,
    get_current_weather_by_city,
    get_forecast_by_city
)

from ai import (
    classify_weather_query,
    generate_weather_response
)


app = FastAPI(
    title="WeatherGPT API",
    description="WeatherGPT MVP Backend",
    version="0.2.0"
)


# Allow the frontend development server to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Request/Response Models
# -------------------------

class Location(BaseModel):
    latitude: float
    longitude: float


class ChatRequest(BaseModel):
    message: str
    conversationId: str | None = None
    location: Location | None = None


class ChatResponse(BaseModel):
    response: str
    conversationId: str


# -------------------------
# Basic endpoints
# -------------------------

@app.get("/")
def home():
    return {
        "message": "WeatherGPT backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# -------------------------
# Weather endpoints
# -------------------------

@app.get("/weather/current")
def current_weather(
    latitude: float,
    longitude: float
):

    try:

        weather = get_current_weather(
            latitude,
            longitude
        )

        return {
            "success": True,
            "weather": weather
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.get("/weather/forecast")
def forecast(
    latitude: float,
    longitude: float
):

    try:

        weather = get_forecast(
            latitude,
            longitude
        )

        return {
            "success": True,
            "weather": weather
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# -------------------------
# Chat endpoint
# -------------------------

@app.post("/api/chat", response_model=ChatResponse)
@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):

    try:
        conversation_id = (
            request.conversationId
            if request.conversationId
            else "default"
        )

        # 1. Ask Gemini what kind of weather information is needed and if a city was named
        query_type = classify_weather_query(request.message)

        # 2. Determine weather data to retrieve
        weather_data = None
        city_name = getattr(query_type, "location_name", None)

        if city_name:
            # Query by specified city
            try:
                if query_type.type == "current":
                    weather_data = get_current_weather_by_city(city_name)
                elif query_type.type == "forecast":
                    weather_data = get_forecast_by_city(city_name)
                else:
                    raise ValueError(f"Unsupported query type: {query_type.type}")
            except Exception:
                # If city not found or weather API error
                return ChatResponse(
                    response=f"I couldn't retrieve weather data for '{city_name}'. Please verify the city name or enable browser location access.",
                    conversationId=conversation_id
                )

        elif request.location is not None:
            # Query by browser coordinates
            latitude = request.location.latitude
            longitude = request.location.longitude

            if query_type.type == "current":
                weather_data = get_current_weather(latitude, longitude)
            elif query_type.type == "forecast":
                weather_data = get_forecast(latitude, longitude)
            else:
                raise ValueError(f"Unsupported query type: {query_type.type}")

        else:
            # No city mentioned and no coordinates provided
            return ChatResponse(
                response="To check the weather, please allow location access in your browser or specify a city in your question (for example, 'What's the weather in Seattle?').",
                conversationId=conversation_id
            )

        # 3. Send real weather data to Gemini
        answer = generate_weather_response(
            request.message,
            weather_data
        )

        # 4. Return response
        return ChatResponse(
            response=answer,
            conversationId=conversation_id
        )

    except HTTPException:
        raise

    except RuntimeError as e:
        # e.g. API keys not configured
        return ChatResponse(
            response=f"Configuration notice: {str(e)}",
            conversationId=request.conversationId or "default"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

