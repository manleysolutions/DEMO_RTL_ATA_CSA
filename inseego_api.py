#!/usr/bin/env python3
import requests
import json

# Fixed tenant + subscription key from API portal
TENANT_NAME = "manleysolutions"
SUBSCRIPTION_KEY = "2ec0ebd92df14930affc06fa59faa068"
APP_NAME = "Inseego Connect"

BASE_URL = "https://device.pegasus.inseego.com/inseego-connect-api/v1/devicelist"

def main():
    headers = {
        "subscription-Key": SUBSCRIPTION_KEY,
        "x-application-name": APP_NAME,
        "x-tenant-name": TENANT_NAME,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    try:
        resp = requests.get(BASE_URL, headers=headers, params={"pageNo": 1, "pageSize": 10}, timeout=15)
        print(f"➡️ GET {resp.url}")
        print(f"🧾 Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print("✅ Success")
            print(json.dumps(data, indent=2))
        else:
            print("❌ Error")
            print(resp.text)
    except Exception as e:
        print(f"⚠️ Exception: {e}")

if __name__ == "__main__":
    main()
