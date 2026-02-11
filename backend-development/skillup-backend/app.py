#!usr/bin/python3

from flask import Flask

app = Flask(__name__)

@app.route('/api/test-cache', methods=['GET'])
def test_cache():
    return "Cache test successful", 200

if __name__ == '__main__':
    app.run(debug=True)

