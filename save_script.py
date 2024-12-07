import requests
import json
import datetime
import time


url = "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"


while 1:
    response = requests.get(url)

    if response.status_code == 200:

        data = response.json()

        filtered_data = []
        for station in data:
            filtered_station = station["available_rent_bikes"]
            filtered_data.append(filtered_station)

        with open("./data/" +datetime.datetime.now().strftime("%Y%m%d%H%M")+".json", "a") as file:
            file.write(json.dumps(filtered_data) + "\n")

    time.sleep(180)