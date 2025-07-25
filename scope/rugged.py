import requests
import yaml
import json
import logging
from datetime import datetime, timedelta
import os


def get_config_path():
    return "scope/config.yaml" if os.path.exists("scope/config.yaml") else "config.yaml"
with open(get_config_path(), "r", encoding="utf-8") as file:
    config = yaml.safe_load(file)

# Watsonx API connection details
logging.basicConfig(level=logging.DEBUG)
IBM_WATSON_URL = config["watsonx"]["url"]
IBM_PROJECT_ID = config["watsonx"]["project_id"]
IBM_API_KEY = config["watsonx"]["api_key"]
IBM_MODEL_ID = config["watsonx"]["model_id"]
access_token = None
token_expiry = None

def get_ibm_access_token():
    global access_token, token_expiry
    if access_token and token_expiry and datetime.now() < token_expiry:
        logging.info("Using cached IBM access token")
        return access_token
    
    url = "https://iam.cloud.ibm.com/identity/token"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
    }
    data = {
        "apikey": IBM_API_KEY,
        "grant_type": "urn:ibm:params:oauth:grant-type:apikey"
    }
    
    logging.info("Requesting new IBM access token...")
    response = requests.post(url, headers=headers, data=data)
    
    if response.status_code != 200:
        logging.error(f"Failed to get access token: {response.text}")
        raise Exception(f"Failed to get access token: {response.text}")
    
    token_data = response.json()
    access_token = token_data["access_token"]
    expires_in = token_data["expires_in"]
    token_expiry = datetime.now() + timedelta(seconds=expires_in - 300)  # 5 min buffer
    logging.info("Received new access token")
    return access_token

def callx(text, instruction):
    """Updated function to use Watsonx Chat API format"""
    token = get_ibm_access_token()
    print('called', flush=True)
    logging.info("Access token retrieved successfully")
    
    # Use the new messages format for chat API
    messages = [
        {
            "role": "system",
            "content": instruction
        },
        {
            "role": "user", 
            "content": text
        }
    ]
    
    # Use the request body template from config
    body = {
        "messages": messages,
        "project_id": IBM_PROJECT_ID,
        "model_id": IBM_MODEL_ID,
        "frequency_penalty": config["llm_params"]["frequency_penalty"],
        "max_tokens": config["llm_params"]["max_tokens"],
        "presence_penalty": config["llm_params"]["presence_penalty"],
        "temperature": config["llm_params"]["temperature"],
        "top_p": config["llm_params"]["top_p"]
    }
    
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    logging.debug("Payload for IBM Watson API request: %s", json.dumps(body, indent=2))
    logging.info("Sending request to IBM Watson API at URL: %s", IBM_WATSON_URL)
    
    try:
        response = requests.post(IBM_WATSON_URL, headers=headers, json=body, timeout=30)
        
        logging.info(f"Response Status Code: {response.status_code}")
        logging.debug(f"Response Headers: {response.headers}")
        
        if response.status_code == 404:
            logging.error("404 Error - Check if the URL is correct and the service is available")
            logging.error(f"URL being used: {IBM_WATSON_URL}")
            raise Exception(f"404 Not Found - URL may be incorrect: {IBM_WATSON_URL}")
        
        if response.status_code == 401:
            logging.error("401 Unauthorized - Check API key and authentication")
            raise Exception("Authentication failed - check API key")
        
        if response.status_code == 403:
            logging.error("403 Forbidden - Check project permissions")
            raise Exception("Access forbidden - check project permissions")
        
        if response.status_code != 200:
            logging.error(f"IBM Watson API call failed with status {response.status_code}: {response.text}")
            raise Exception(f"API call failed with status {response.status_code}: {response.text}")
        
        response_data = response.json()
        logging.debug("Full response: %s", json.dumps(response_data, indent=2))
        
        # Updated response parsing for chat API
        if "choices" in response_data and len(response_data["choices"]) > 0:
            message = response_data["choices"][0].get("message", {})
            generated_text = message.get("content", "").strip()
            if generated_text:
                logging.info("Generated text successfully retrieved from response.")
                print(generated_text, flush=True)
                return generated_text
            else:
                logging.error("Generated text is empty in the message content.")
                raise Exception("Generated text is empty in the message content.")
        else:
            logging.error("Unexpected response format: 'choices' key is missing or empty.")
            logging.error(f"Response structure: {response_data}")
            raise Exception("Unexpected response format: 'choices' key is missing or empty.")

    except requests.exceptions.Timeout:
        logging.error("Request timeout - API call took too long")
        raise Exception("Request timeout")
    except requests.exceptions.ConnectionError:
        logging.error("Connection error - Unable to connect to IBM Watson API")
        raise Exception("Connection error")
    except requests.exceptions.RequestException as e:
        logging.error("Request to IBM Watson API failed: %s", e)
        raise

def test_api_endpoint():
    """Test function to verify API endpoint and authentication"""
    try:
        token = get_ibm_access_token()
        print(f"Successfully obtained access token")
        
        # Test with a simple request
        simple_text = "Hello, how are you?"
        simple_instruction = "You are Granite, an AI language model developed by IBM. Respond politely and briefly."
        
        result = callx(simple_text, simple_instruction)
        print(f"API test successful. Response: {result}")
        return True
        
    except Exception as e:
        print(f"API test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing IBM Watson API connection...")
    if test_api_endpoint():
        print("✅ API connection successful!")
    else:
        print("❌ API connection failed!")
        print("\nTroubleshooting steps:")
        print("1. Verify your API key is correct")
        print("2. Check if your project ID is valid")
        print("3. Ensure you have access to the specified model")
        print("4. Verify the Watson ML service URL for your region")
        print("5. Check if your IBM Cloud account has sufficient permissions")