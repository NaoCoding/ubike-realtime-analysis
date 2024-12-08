from folium.plugins import MarkerCluster

import folium
import os
import requests
import folium
import json

def getColor(a, b):
    
    if a/b >= 0.6:
        return "green"
    elif a/b >= 0.3:
        return "orange"
    else:
        return "red"


def CreateMap(date):

    if os.path.exists(f"map/{date}.html"):
        return f"map/{date}.html"
    
    _folium = folium.Map(
        	zoom_start=13,
        	location=[25.0375105, 121.5636349],
            attr="<a href=https://github.com/NaoCoding/ubike-realtime-analysis>Github Repo</a>"
        )
    
    _foliumMarkerCluster = MarkerCluster().add_to(_folium)

    with open(f'data/{date}.json' , "r" , encoding='utf-8') as ubike_data:
        with open("data/youbike_immediate.json" , "r" , encoding='utf-8') as stations:
            stations_data = json.load(stations)
            ubike_data = json.load(ubike_data)
            ubike = 0
            for station in stations_data:
                folium.Marker(
                        location=[station['latitude'], station['longitude']],
                        popup=f"站點名稱：{station['sna']}\n可借車輛：{ubike_data[ubike]}",
                        icon=folium.Icon(color=getColor(int(ubike_data[ubike]), station['total']
                                                                                    ))).add_to(_foliumMarkerCluster)
                ubike += 1   
    _folium.save(f"map/{date}.html")
    return f"map/{date}.html"