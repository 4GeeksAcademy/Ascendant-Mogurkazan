from flask import Blueprint, request, jsonify
import openai
from openai import OpenAI, APIError
import os
import traceback

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

api = Blueprint('openai_api', __name__)

def format_question(day, month, year, time, city, country):
    question = (f"Please provide the zodiac sign, ascendant, lunar influence, "
                f"and a description of the main characteristics for a person born on {day} {month} {year} "
                f"at {time} in {city}, {country}.")
    return question

@api.route('/ask', methods=['POST'])
def ask_openai():
    try:
        data = request.get_json()
        day = data.get("day")
        month = data.get("month")
        year = data.get("year")
        time = data.get("time")
        city = data.get("city")
        country = data.get("country")

        if not all([day, month, year, time, city, country]):
            return jsonify({"error": "All fields are required"}), 400

        question = format_question(day, month, year, time, city, country)

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": question}
            ],
            max_tokens=150
        )
        return jsonify({"response": response.choices[0].message.content.strip()}), 200
    except APIError as e:
        print(f"OpenAI API error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        print("Unexpected error:", str(e))
        traceback.print_exc()
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500
