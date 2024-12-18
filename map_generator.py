
from mymarker import MarkerCluster
from folium.plugins import Draw
from jinja2 import Template
from folium.elements import JSCSSMixin

import folium
import os
import requests
import json
from draw import Draw

def getColor(a, b):
    
    if a/b >= 0.6:
        return "green"
    elif a/b >= 0.3:
        return "orange"
    else:
        return "red"


def CreateMap(date):

    if not os.path.exists("map"):
        os.mkdir("map")

    if os.path.exists(f"map/{date}.html"):
        return f"map/{date}.html"
    
    _folium = folium.Map(
        	zoom_start=13,
        	location=[25.0375105, 121.5636349],
            attr="<a href=https://github.com/NaoCoding/ubike-realtime-analysis>Github Repo</a>"
        )
    
    _foliumMarkerCluster = MarkerCluster().add_to(_folium)

    click_template = """{% macro script(this, kwargs) %}
    var {{ this.get_name() }} = L.marker(
        {{ this.location|tojson }},
        {{ this.options|tojson }}
    ).addTo({{ this._parent.get_name() }}).on('click', selectStation);
{% endmacro %}"""

    folium.Marker._template = Template(click_template)

    with open(f'data/{date}.json' , "r" , encoding='utf-8') as ubike_data:
        with open("./station_info.json" , "r" , encoding='utf-8') as stations:
            stations_data = json.load(stations)
            ubike_data = json.load(ubike_data)
            ubike = 0

            draw = Draw(
            export=True,
            filename='data.geojson',
            position='topleft',
            show_geometry_on_click=True,
            draw_options={'polyline': False,
                          'circlemarker': False,
                          'polygon': False,
                          'marker': False,
                          'export': False,
                          "circle" : False},

            )

            

            draw.add_to(_folium)

            for station in stations_data:
                ubike = -1
                for i in range(len(ubike_data)):
                    if ubike_data[i][1] == station['sno']:
                        ubike = i
                        break
                if ubike != -1:
                    folium.Marker(
                            location=[station['latitude'], station['longitude']],
                            popup=f"站點名稱：{station['sna']}\n可借車輛：{ubike_data[ubike][0]}",
                            icon=folium.Icon(color=getColor(int(ubike_data[ubike][0]), station['total']
                                                                                        ))).add_to(_foliumMarkerCluster)
    e = folium.Element("""
                    function selectStation(e){
                       parent.selectStation(e.latlng.lat, e.latlng.lng)
                    }
                       """)
    html = _folium.get_root()
    html.script.get_root().render()
    html.script._children[e.get_name()] = e   
    
    _folium.save(f"map/{date}.html")
    return f"map/{date}.html"