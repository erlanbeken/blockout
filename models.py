from server import db
import datetime

def commit():
    try:
        db.session.commit()
    except:
       db.session.rollback()
       raise
    finally:
       db.session.close()  # optional, depends on use case


def create_model(model_class, **params):
    model = model_class(**params)
    hasattr(model, 'on_create') and model.on_create(params)
    db.session.add(model)
    db.session.commit()
    return model


class BlockoutModel(object):
    @classmethod
    def find_by_code(cls, game_code):
        query = cls.query.filter(cls.code == game_code)
        return query.first()


class GameUser(db.Model):
    __tablename__ = 'game_user'
    id            = db.Column(db.Integer, primary_key=True)
    game_id       = db.Column(db.Integer, db.ForeignKey('game.id'), primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    score         = db.Column(db.Integer, nullable=True)
    map           = db.Column(db.Text, nullable=True)
    created       = db.Column( db.DateTime, nullable=False, default=datetime.datetime.now)
    finished      = db.Column(db.DateTime, nullable=True)


class User(db.Model, BlockoutModel):
    id              = db.Column(db.Integer, primary_key=True)
    code            = db.Column(db.String(100), nullable=False, unique=True)
    alias           = db.Column(db.String(100), nullable=True)
    email           = db.Column(db.String(200), unique=True, nullable=True)
    password        = db.Column(db.String(32), nullable=True)
    top_score       = db.Column(db.Integer, default=0)
    created         = db.Column(db.DateTime, nullable=False, default=datetime.datetime.now)
    last_seen       = db.Column(db.DateTime, nullable=True)
    games           = db.relationship('GameUser', backref='user', lazy='dynamic')



class Game(db.Model, BlockoutModel):
    id            = db.Column(db.Integer, primary_key=True)
    code          = db.Column(db.String(100), nullable=False, unique=True)
    users         = db.relationship('GameUser', backref="games")
    created       = db.Column(db.DateTime, nullable=False, default=datetime.datetime.now)
    finished      = db.Column(db.DateTime, nullable=True)
    orders        = db.relationship('GameUser', backref='order', lazy='dynamic')


if __name__ == '__main__':
    db.drop_all()
    db.create_all()