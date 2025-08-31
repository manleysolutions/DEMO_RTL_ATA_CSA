#!/usr/bin/env python3
import os, time, subprocess

WIFI_GATEWAY = "10.0.0.1"
LTE_GATEWAY  = "192.168.2.1"
CHECK_HOST   = "8.8.8.8"

def run(cmd):
    return subprocess.call(cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) == 0

def set_default(gateway, dev, metric):
    os.system(f"sudo ip route replace default via {gateway} dev {dev} metric {metric}")

while True:
    # Test Wi-Fi first
    wifi_ok = run(f"ping -c 2 -W 2 {CHECK_HOST} -I wlan0")
    if wifi_ok:
        set_default(WIFI_GATEWAY, "wlan0", 100)
        print("[CSA Failover] Wi-Fi OK → using wlan0")
    else:
        # fallback to LTE
        lte_ok = run(f"ping -c 2 -W 2 {CHECK_HOST} -I eth0")
        if lte_ok:
            set_default(LTE_GATEWAY, "eth0", 50)
            print("[CSA Failover] Wi-Fi DOWN → switched to LTE (eth0)")
        else:
            print("[CSA Failover] WARNING: Neither Wi-Fi nor LTE reachable!")

    time.sleep(10)  # check every 10s
