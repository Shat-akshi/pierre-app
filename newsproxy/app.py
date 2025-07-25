from flask import Flask, jsonify, request
import requests
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

NEWS_API_KEY = os.getenv("NEWS_API_KEY")


@app.route("/api/newsproxy", methods=["GET"])
def get_news():
    # Get all query parameters from frontend request
    params = request.args.to_dict()
    # Add your API key
    params["apiKey"] = NEWS_API_KEY

    # Determine endpoint from query param or default to top-headlines
    endpoint = params.pop("endpoint", "top-headlines")
    url = f"https://newsapi.org/v2/{endpoint}"

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"status": "error", "message": str(e)}), 500
