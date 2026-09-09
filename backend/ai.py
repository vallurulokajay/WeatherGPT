import os
from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel

load_dotenv()


def _get_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured. Please set it in backend/.env")
    return genai.Client(api_key=api_key)


class QueryType(BaseModel):
    type: str
    reason: str
    location_name: str | None = None


def classify_weather_query(user_question: str) -> QueryType:
    prompt = f"""
Classify the user's weather question and extract any specified location name if present.

Choose exactly one type:

- current
  Use this when the user is asking about weather happening now.

- forecast
  Use this when the user is asking about future weather such as
  tomorrow, tonight, later today, this weekend, or future days.

If the user specifies a city, region, or place (e.g. "in London", "Tokyo weather", "how's Seattle tomorrow"),
extract that into location_name. If no location is mentioned (e.g. "is it raining?", "weather today", "do I need an umbrella?"), set location_name to null.

USER QUESTION:
{user_question}

Return:
type = "current" or "forecast"
reason = short explanation
location_name = city name or null
"""

    client = _get_client()
    interaction = client.interactions.create(
        model="gemini-3.6-flash",
        input=prompt,
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": QueryType.model_json_schema()
        }
    )

    return QueryType.model_validate_json(
        interaction.output_text
    )


def generate_weather_response(
    user_question: str,
    weather_data: dict
) -> str:
    prompt = f"""
You are WeatherGPT.

Answer the user's question using ONLY the weather data below.

Rules:
- Do not invent weather values.
- Do not make up weather information.
- Only use the supplied weather data for factual weather claims.
- If the data is insufficient, say that additional information is required.
- Keep answers as short and meaningful as possible.
- Keep the answer easy to understand. Don't specify exact values of temperature or percentage of rainfall unless asked. Dont complicate the answer, give a natural response based on the weather data.
- Give practical advice when appropriate.

WEATHER DATA:
{weather_data}

USER QUESTION:
{user_question}
"""

    client = _get_client()
    interaction = client.interactions.create(
        model="gemini-3.6-flash",
        input=prompt
    )

    return interaction.output_text