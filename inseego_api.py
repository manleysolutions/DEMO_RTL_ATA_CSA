import requests
import datetime

BASE_URL = "https://device.pegasus.inseego.com/inseego-connect-api/deviceinfo/api/v1"
API_KEY = "2ec0edb92df14930affc60fa59fa0a68"

TENANT_OPTIONS = [
    "manleysolutions-com-demo",
    "manleysolutions.com",
    "stuart@manleysolutions.com"
]

APP_NAME = "Inseego Connect"

def get_devices(tenant_name, page_no=1, page_size=10):
    headers = {
        "subscription-Key": API_KEY,
        "x-tenant-name": tenant_name,
        "x-application-name": APP_NAME,
        "Content-Type": "application/json"
    }
    url = f"{BASE_URL}/get-devices?pageNo={page_no}&pageSize={page_size}"
    resp = requests.post(url, headers=headers, json={})
    return resp

def pretty_print_devices(devices):
    data = devices.get("data", {})
    device_list = data.get("deviceList", [])
    print(f"Found {len(device_list)} devices:\n")
    for d in device_list:
        imei = d.get("deviceImei", "N/A")
        model = d.get("deviceModel", "N/A")
        name = d.get("deviceName", "N/A")
        status = d.get("deviceCommunicationStatus", "N/A")
        fw = d.get("deviceFirmware", "N/A")
        last_comm_epoch = d.get("lastCommunicationTime")
        if last_comm_epoch:
            last_comm = datetime.datetime.fromtimestamp(last_comm_epoch / 1000).strftime("%Y-%m-%d %H:%M:%S")
        else:
            last_comm = "N/A"
        print(f"📡 Device: {name}\n   IMEI: {imei}\n   Model: {model}\n   Firmware: {fw}\n   Status: {status}\n   Last Seen: {last_comm}\n")

if __name__ == "__main__":
    for tenant in TENANT_OPTIONS:
        print(f"\n🔎 Trying tenant: {tenant}")
        try:
            resp = get_devices(tenant)
            if resp.status_code == 200:
                print(f"✅ Success with tenant: {tenant}")
                pretty_print_devices(resp.json())
                break
            else:
                print(f"❌ Failed with tenant: {tenant} (HTTP {resp.status_code})")
        except Exception as e:
            print(f"❌ Error with tenant {tenant}:", e)
