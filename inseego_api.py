#!/usr/bin/env python3
import requests, json

TENANT_NAME = "manleysolutions"
SUBSCRIPTION_KEY = "2ec0ebd92df14930affc06fa59faa068"
APP_NAME = "Inseego Connect"

# Try the API Management host instead of Pegasus
BASE_URL = "https://connect-api.inseego.com/inseego-connect-api/v1/devicelist"

def main():
    headers = {
        "subscription-Key": SUBSCRIPTION_KEY,
        "x-application-name": APP_NAME,
        "x-tenant-name": TENANT_NAME,
        "Content-Type": "application/json",
    }

    resp = requests.get(BASE_URL, headers=headers, params={"pageNo": 1, "pageSize": 10}, timeout=15)
    print(f"➡️ GET {resp.url}")
    print(f"🧾 Status: {resp.status_code}")
    try:
        print(json.dumps(resp.json(), indent=2))
    except Exception:
        print(resp.text)

if __name__ == "__main__":
    main()
