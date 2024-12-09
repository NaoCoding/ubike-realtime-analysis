from flask import Flask, jsonify, request,Response
from flask_cors import CORS
import os
import map_generator

app = Flask(__name__)
CORS(app)

@app.route('/api/map', methods=['GET'])
def get_data():
    
    date = request.args.get("date")
    
    if date:
        with open(map_generator.CreateMap(date) , "r" , encoding="utf-8") as result:
            return Response(result.read(), mimetype='text/html')
    else:
        return jsonify({"error": "No date provided"}), 400
    
@app.route('/', methods=['GET'])
def index():
    with open("./index.html" , "r" , encoding="utf-8") as result:
        return Response(result.read(), mimetype='text/html')
    
@app.route('/api/get_time' , methods=["GET"])
def get_time():
    
    filelist = os.listdir("./data")
    filelist.sort()
    return jsonify({"start":filelist[0].split(".")[0] , "end":filelist[-1].split(".")[0]})

if __name__ == '__main__':
    app.run(debug=True)
