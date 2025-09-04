#!/usr/bin/env python3
import requests
import os

# 🔑 Credentials – set these in your environment or replace inline
SUBSCRIPTION_KEY = os.getenv("INSEEGO_SUBSCRIPTION_KEY", "YOUR_SUBSCRIPTION_KEY_HERE")

TENANT_OPTIONS = [
    "manleysolutions",
    "manleysolutions.com",
    "manleysolutions-com-demo",
    "stuart@manleysolutions.com",
]

# Corrected endpoint (no extra /api, no query until later)
BASE_URL = "https://device.pegasus.inseego.com/inseego-connect-api/v1/devicelist"

def call_inseego_api(tenant):
    headers = {
        "subscription-Key": SUBSCRIPTION_KEY,
        "x-application-name": "Inseego Connect",
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
        print(f"⚠️ Error with tenant {tenant}: {e}")
        return False

def main():
    print("🔎 Trying tenants on corrected /v1/devicelist endpoint...\n")
    for tenant in TENANT_OPTIONS:
        if call_inseego_api(tenant):
            break
    else:
        print("\n❌ No tenant worked. Check tenant ID in Inseego portal.")

if __name__ == "__main__":
    main()
