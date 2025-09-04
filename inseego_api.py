#!/usr/bin/env python3
import requests
import os

# 🔑 Replace these with your actual API client values
API_KEY = os.getenv("INSEEGO_API_KEY", "YOUR_API_KEY_HERE")
CLIENT_ID = os.getenv("INSEEGO_CLIENT_ID", "YOUR_CLIENT_ID_HERE")
CLIENT_SECRET = os.getenv("INSEEGO_CLIENT_SECRET", "YOUR_CLIENT_SECRET_HERE")

# Possible tenant names (cycle through)
TENANT_OPTIONS = [
    "manleysolutions",
    "manleysolutions.com",
    "manleysolutions-com-demo",
    "stuart@manleysolutions.com",
]

# Inseego base URL
BASE_URL = "https://device.pegasus.inseego.com/inseego-connect-api/deviceinfo/api/v1/get-devices?pageNo=1"

def call_inseego_api(tenant):
    """
    Make API request for a given tenant
    """
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "x-tenant-name": tenant,
        "Content-Type": "application/json",
    }

    try:
        resp = requests.get(BASE_URL, headers=headers, timeout=10)
        if resp.status_code == 200:
            print(f"✅ Success with tenant: {tenant}")
            print(resp.json())
            return True
        else:
            print(f"❌ Failed with tenant: {tenant} (HTTP {resp.status_code})")
            print("Response text:", resp.text.strip())
            return False
    except Exception as e:
        print(f"⚠️ Error calling Inseego API for tenant {tenant}: {e}")
        return False


def main():
    print("🔎 Trying available tenant names...\n")
    for tenant in TENANT_OPTIONS:
        success = call_inseego_api(tenant)
        if success:
            break
    else:
        print("\n❌ No tenant worked. Double-check API key, client ID/secret, and tenant name.")


if __name__ == "__main__":
    main()

