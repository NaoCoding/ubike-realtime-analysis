import requests
import json
import datetime
import time
import os


url = "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"


while 1:
    response = requests.get(url)

    with open("./station_info.json" , "r" , encoding="utf-8") as f:

        if response.status_code == 200:

            data = response.json()

            try:
                n = json.load(f)
            except:
                n = data

            

            filtered_data = []
            for station in data:
                filtered_station = [station["available_rent_bikes"] , station["sno"]]
                filtered_data.append(filtered_station)
                inside = 0
            
                if not any(station["sno"] == i['sno'] for i in n):
                    n.append(station)
            
            
            f.close()
            
            with open("./station_info.json" , "w" , encoding="utf-8") as file:
                file.write(json.dumps(n) + "\n")

            if not os.path.exists("data"):
                os.mkdir("data")

            with open("./data/" +datetime.datetime.now().strftime("%Y%m%d%H%M")+".json", "a") as file:
                file.write(json.dumps(filtered_data) + "\n")

    time.sleep(180)