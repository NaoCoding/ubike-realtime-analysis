from flask import Flask, jsonify, request,Response
from flask_cors import CORS
import os
import map_generator

app = Flask(__name__)
CORS(app)

@app.route('/api/map', methods=['GET'])
def get_map():
    
    date = request.args.get("date")
    
    if date:
        with open(map_generator.CreateMap(date) , "r" , encoding="utf-8") as result:
            return Response(result.read(), mimetype='text/html')
    else:
        return jsonify({"error": "No date provided"}), 400

@app.route('/api/map_now', methods=['GET'])
def get_mapnow():
    
    filelist = os.listdir("./data")
    filelist.sort()
    date = filelist[-1].split(".")[0]
    
    if date:
        with open(map_generator.CreateMap(date) , "r" , encoding="utf-8") as result:
            return Response(result.read(), mimetype='text/html')
    else:
        return jsonify({"error": "No date provided"}), 400
    
@app.route('/', methods=['GET'])
def index():
    with open("./index.html" , "r" , encoding="utf-8") as result:
        return Response(result.read(), mimetype='text/html')
    
@app.route('/api/station_info', methods=['GET'])
def station_info():
    with open("./station_info.json" , "r" , encoding="utf-8") as result:
        return jsonify(result.read())

@app.route('/api/get_data', methods=['GET'])
def get_data():
    date = request.args.get("date")
    with open(f"./data/{date}.json" , "r" , encoding="utf-8") as result:
        return jsonify(result.read())
    
@app.route('/api/get_time' , methods=["GET"])
def get_time():
    
    filelist = os.listdir("./data")
    filelist.sort()
    return jsonify({"time":[file.split(".")[0] for file in filelist]})

if __name__ == '__main__':
    app.run(debug=True)
