import requests
import json

def test_watsonx_api_with_headers(api_key, project_id):
    print("🔐 Getting access token...")
    token_url = "https://iam.cloud.ibm.com/identity/token"
    token_headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
    }
    token_data = {
        "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
        "apikey": api_key
    }
    try:
        token_response = requests.post(token_url, headers=token_headers, data=token_data, timeout=30)
        if token_response.status_code != 200:
            print(f"❌ Failed to get token: {token_response.status_code}")
            print(token_response.text)
            return
        access_token = token_response.json()["access_token"]
        print("✅ Access token obtained!")

        # Replace with actual Granite chat endpoint
        watsonx_url = "https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29"
        watsonx_headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        watsonx_payload = {
            "model_id": "ibm/granite-3-8b-instruct",
            "project_id": project_id,
            "messages": [
                {
                    "role": "user",
                    "content": "Summarize the latest AI trends in South Asia."
                }
            ],
            "parameters": {
                "max_tokens": 200,
                "temperature": 0.5
            }
        }

        print("🚀 Sending API request to Granite...")
        response = requests.post(watsonx_url, headers=watsonx_headers, json=watsonx_payload, timeout=60)

        print("\n📊 Rate Limiting Info (if available):")
        rate_headers = ['X-RateLimit-Remaining', 'X-RateLimit-Limit', 'X-RateLimit-Reset']
        for h in rate_headers:
            if h in response.headers:
                print(f"{h}: {response.headers[h]}")
        
        print(f"\n📦 Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Successful!")
            print(json.dumps(response.json(), indent=2))
        else:
            print("❌ API call failed:")
            print(response.text)
    
    except Exception as e:
        print(f"❌ Request failed: {e}")

# === Replace with your actual values ===
if __name__ == "__main__":
    API_KEY = "Y5U2-8CprdNj8M-k5_7z5qCEqR0hWvKD0ow06qFAopVN"
    PROJECT_ID = "7765053a-6228-4fff-970d-31f06b7ca3df"
    test_watsonx_api_with_headers(API_KEY, PROJECT_ID)
