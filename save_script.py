import requests
import datetime
import time

file = requests.get("https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json")

while 1:
    with open('./data/' + datetime.datetime.now().strftime("%Y%m%d%H%M") + '.json', 'w' , encoding="utf_8_sig") as f:
        f.write(file.text)
    time.sleep(60)
