# gunicorn -k flask_sockets.worker -b 0.0.0.0:5000 server:app

import datetime
import os
import time
import traceback
import json

from flask import Flask, send_from_directory, request, make_response, jsonify
from flask_sockets import Sockets
from flask_sqlalchemy import SQLAlchemy
from utils import generate_unique_code
from flask_cors import CORS

app  = Flask('app', static_url_path=os.path.abspath('./'))
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
sockets = Sockets(app)

app.config['SECRET_KEY']              = 'secret!'
app.config['SQLALCHEMY_POOL_SIZE']    = 100
app.config['SQLALCHEMY_POOL_RECYCLE'] = 280
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:root@localhost/blockout'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN']  = True


db = SQLAlchemy(app)

db.init_app(app)

all_games = {}

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
        print(traceback.format_exc())
        return jsonify({'error': repr(e)})


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

def socket_connect(socket, data):
    global all_games

    game_code = data['game_code']
    user_code = data['user_code']

    all_games.setdefault(game_code, {})[user_code] = socket
    print all_games


def socket_piece_dropped(socket, data):
    from models import Game, User, GameUser, commit

    user_code = data.get('user_code')
    game_code = data.get('game_code')

    game = Game.find_by_code(game_code)
    user = User.find_by_code(user_code)

    GameUser.update_map(game.id, user.id, data.get('map'))

    send_message(game_code, user_code, 'PIECE_DROPPED')


def socket_level_removed(socket, data):
    print 'level removed'

    from models import User, Game, GameUser, commit

    user_code = data.get('user_code')
    game_code = data.get('game_code')

    game = Game.find_by_code(game_code)
    user = User.find_by_code(user_code)

    GameUser.update_map(game.id, user.id, data['map'])

    send_message(game_code, user_code, 'LEVEL_REMOVED:' + str(data['levels']))


def socket_game_over(data):
    from models import User

    user_code = data.get('user_code')
    game_code = data.get('game_code')

    GameUser.finish(game.id, user.id)

    send_message(game_code, user_code, 'GAME_OVER')

#----------------------------------------------

@sockets.route('/ws')
def socket(socket):
    while True:
        result = ''
        try:
            message = json.loads(socket.receive())

            assert 'method' in  message

            handler_name = 'socket_' + message['method']
            if handler_name in globals():
                result = globals()[handler_name](socket, message.get('data', {})) or 'OK'

        except Exception as e:
            print repr(e)
            result = 'Error: ' + repr(e)
        finally:
            socket.send(result)


def send_message(game_code, sender_user_code, message):
    for user_code, socket in all_games[game_code].items():
        if user_code != sender_user_code:
            # print 'sending {} to {}'.format(message, user_code)
            socket.send(message)



if __name__ == '__main__':
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler

    server = pywsgi.WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    server.serve_forever()
    # app.run(host='0.0.0.0', port=5000, debug=True)
