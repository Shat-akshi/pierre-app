from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

from run_full_pipeline import generate_trends_summary

@app.route('/api/market-trends', methods=['POST'])
def market_trends():
    data = request.get_json()
    industry = data.get('industry')
    use_case = data.get('use_case')
    region = data.get('region')

    try:
        summary = generate_rends_summary(industry, use_case, region)
        return jsonify(summary)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
