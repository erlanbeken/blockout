import datetime
import os
import time
from flask import Flask, send_from_directory, request, make_response, jsonify
from flask_socketio import SocketIO, emit, send, join_room, leave_room

import eventlet

from flask_sqlalchemy import SQLAlchemy
from utils import generate_unique_code
from flask_cors import CORS

app  = Flask('app', static_url_path=os.path.abspath('./'))
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['SECRET_KEY']              = 'secret!'
app.config['SQLALCHEMY_POOL_SIZE']    = 100
app.config['SQLALCHEMY_POOL_RECYCLE'] = 280
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:root@localhost/blockout'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN']  = True

socketio = SocketIO(app)
db       = SQLAlchemy(app)

db.init_app(app)

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)

@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('css', path)

@app.route('/')
@app.route('/index.html')
def send_index_html():
    return send_from_directory('.', 'index.html')

@app.route('/api/get_user_info', methods=["POST"])
def get_user_info():
    try:
        from models import create_model, commit, User, Game, GameUser

        data      = request.get_json()
        user_code = data.get('user_code')
        game_code = data.get('game_code')

        if not user_code:
            # create new user
            user_code = generate_unique_code()
            user = create_model(User, code=user_code)
        else:
            user = User.find_by_code(user_code)
            assert user, "User not found"
            user.last_seen = datetime.datetime.now()

        result = {
            'top_score': user.top_score,
            'alias'    : user.alias,
            'user_code': user.code
        }

        if game_code:
            game = Game.find_by_code(game_code) or create_model(Game, code=game_code)

            if game.finished:
                result['error'] = "This game has already finished"
            else:
                game_user = GameUser.query.filter(GameUser.user_id == user.id).filter(GameUser.game_id == game.id).first()

                if not game_user:
                    game_user = GameUser(game_id=game.id, user_id=user.id, created=datetime.datetime.now())
                    game.users.append(game_user)
                else:
                    result['map'] = game_user.map

                commit()


        response  = jsonify(result)

        # response.set_cookie('user_code', user_code, domain=request.host, expires=datetime.datetime.now() + datetime.timedelta(days=9000))
        return response
    except Exception as e:
        return jsonify({'error': e})


@app.route('/api/update_user_info', methods=["POST"])
def update_user_info():
    try:
        from models import User, commit

        data      = request.get_json()

        user_code = data.get('user_code')
        user      = User.find_by_code(user_code)

        assert user, 'User not found'
        assert data, 'user info data is missing'

        if 'top_score' in data:
            user.top_score = int(data['top_score'])

        if 'alias' in data:
            user.alias = data['alias']

        commit()

        return jsonify({'result': 'OK'})
    except Exception as e:
        return jsonify({'error': str(e)})

#----------------------------------------------

# @socketio.on('join')
# def on_join(data):
#     username = data['username']
#     room = data['room']
#     join_room(room)
#     # send(username + ' has entered the room.', room=room)


@socketio.on('level_removed')
def level_removed(data):
    from models import User, Game, GameUser, commit

    user_code = data.get('user_code')
    game_code = data.get('game_code')

    game = Game.find_by_code(game_code)
    user = User.find_by_code(user_code)

    GameUser.query.filter(GameUser.game_id==game.id).filter(GameUser.user_id==user.id).first().map = data['map']

    data = {
        'n'         : data['levels'],
        'user_code' : user_code,
        'user_alias': user.alias
    }
    commit()

    emit('feces_time', data, room=game_code)


@socketio.on('game_over')
def game_over(data):
    from models import User

    user_code = data.get('user_code')
    game_code = data.get('game_code')

    user    = User.find_by_code(user_code)

    data = {
        'user_code' : user_code,
        'user_alias': user.alias
    }
    emit('game_over', data, room=game_code)


@socketio.on('piece_dropped')
def piece_dropped(data):
    from models import Game, User, GameUser, commit

    user_code = data.get('user_code')
    game_code = data.get('game_code')

    game = Game.find_by_code(game_code)
    user = User.find_by_code(user_code)

    user.games.filter(GameUser.game_id == game.id).first().map = data.get('map')

    commit()


@socketio.on('connect')
def connect():
    pass
    # join_room(request.cookies['game_code'])


@socketio.on('join')
def join(data):
    assert 'game_code' in data, "Game code required"
    join_room(data['game_code'])


@socketio.on('disconnect')
def disconnect():
    print 'DISCONNECT'
    # assert 'game_code' in request.cookies, "Game code required"
    # leave_room(request.cookies['game_code'])


if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0')
