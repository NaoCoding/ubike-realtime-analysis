from flask import Flask, jsonify, request,Response
from flask_cors import CORS

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
    


if __name__ == '__main__':
    app.run(debug=True)
