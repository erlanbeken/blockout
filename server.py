import datetime
import os
import time
from flask import Flask, render_template, send_from_directory, request, make_response, jsonify
from flask_socketio import SocketIO, emit, send, join_room, leave_room

from flask_sqlalchemy import SQLAlchemy
from utils import generate_unique_code

template_dir = os.path.abspath('./')

app = Flask('app', template_folder=template_dir)

app.config['SECRET_KEY']              = 'secret!'
app.config['SQLALCHEMY_POOL_SIZE']    = 100
app.config['SQLALCHEMY_POOL_RECYCLE'] = 280
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('CLEARDB_DATABASE_URL', 'mysql://root:root@localhost/blockout').replace('?reconnect=true', '')
# 'mysql://b183e653bf85f7:113e513f@us-cdbr-iron-east-05.cleardb.net/heroku_ee6fd50cdca3414'

socketio = SocketIO(app)
db       = SQLAlchemy(app)

db.init_app(app)

@app.route('/')
def index():
    from models import create_model, commit, User, Game

    game_code = request.args.get('game')
    user_code = request.cookies.get('user_code')

    response  = make_response(render_template('index.html'))

    if not user_code:
        # create new user
        user_code = generate_unique_code()
        user = create_model(User, code=user_code)

        expire_date = datetime.datetime.now() + datetime.timedelta(days=9000)
        response.set_cookie('user_code', user_code, domain=request.host, expires=expire_date)
    else:
        user = User.find_by_code(user_code)
        assert user, "User not found"
        user.last_seen = datetime.datetime.now()

    if game_code:
        game = Game.find_by_code(game_code)

        if not game:
            game = create_model(Game, code=game_code)

        user.game = game
        commit()

    return response


@app.route('/get_user_info')
def get_user_info():
    from models import User

    user_code = request.cookies.get('user_code')
    user      = User.find_by_code(user_code)

    return jsonify({'top_score': user.top_score, 'alias': user.alias})


@app.route('/update_user_info', methods=["POST"])
def update_user_info():
    from models import User, commit

    user_code = request.cookies.get('user_code')
    user      = User.find_by_code(user_code)
    data      = request.get_json()

    assert user, 'User not found'
    assert data, 'user info data is missing'


    if 'top_score' in data:
        user.top_score = int(data['value'])

    if 'alias' in data:
        user.alias = data['alias']

    commit()

    return jsonify({'result': 'OK'})


@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)


@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('css', path)


#----------------------------------------------

# @socketio.on('join')
# def on_join(data):
#     username = data['username']
#     room = data['room']
#     join_room(room)
#     # send(username + ' has entered the room.', room=room)


@socketio.on('level_removed')
def level_removed(data):
    from models import User

    user_code = request.cookies.get('user_code')
    game_code = request.cookies.get('game_code')
    user    = User.find_by_code(user_code)

    data = {
        'n'         : data['levels'],
        'user_code' : user_code,
        'user_alias': user.alias
    }
    emit('feces_time', data, room=game_code)


@socketio.on('game_over')
def game_over():
    from models import User

    user_code = request.cookies.get('user_code')
    game_code = request.cookies.get('game_code')

    user    = User.find_by_code(user_code)

    data = {
        'user_code' : user_code,
        'user_alias': user.alias
    }
    emit('game_over', data, room=game_code)


@socketio.on('connect')
def connect():
    assert 'game_code' in request.cookies, "Game code required"
    join_room(request.cookies['game_code'])

@socketio.on('disconnect')
def disconnect():
    assert 'game_code' in request.cookies, "Game code required"
    leave_room(request.cookies['game_code'])


if __name__ == '__main__':
    socketio.run(app, debug=True)
