## UBike Real-time Analysis

#### Description

This project is the final project of NTNU Data Visualization


#### Map Generator API

API Location : `http://localhost:5000/api/map` <br>
API Description : `Get Map Data`<br>
API Parameter : `date`<br>
API Return : `html`

Usage : After opening `server.py`, you can use the following URL to get the map data. 

Example : `http://localhost:5000/api/map?date=201912070533`
= get the map of 2019-12-07 05:33

#### Time History Data API

API Location : `http://localhost:5000/api/get_time` <br>
API Description : `Get Time History Data`<br>
API Return : `json`

Usage : After opening `server.py`, you can use the following URL to get the history data.

Example : `http://localhost:5000/api/get_time` = 
```
{
    "start" : oldest.json file time
    "end" : newest.json file time
    "time" : [array] .json file list

}
```



#### ToDo

`Server storage (12/4)`
- [x] `Basic storage and API ruleset`

`History System (12/7)`
- [x] `Auto Storing UBike API Data Every three mins`

`Python Folium Map`
- [ ] `Map Selection Button(12/13)`
- [x] `Station Marker Color Difference(12/7)`

`Web Page`
- [ ] `Web Page Design(12/13)`
- [x] `input range(12/9)`

`D3.js (12/13)` 
- [ ] `Bar Chart`
- [ ] `Pie Chart`
- [ ] `Plot`
- [ ] `Line Chart`

`Extra Function + Frontend Design (12/15)`
- [ ] `Search Function`
- [ ] `Change Language`
- [ ] `Light / Dark Theme`



