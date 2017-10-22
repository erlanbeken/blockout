from server import db
import datetime

def commit():
    db.session.commit()


def create_model(model_class, **params):
    model = model_class(**params)
    hasattr(model, 'on_create') and model.on_create(params)
    db.session.add(model)
    db.session.commit()
    return model


class User(db.Model):
    id              = db.Column(db.Integer, primary_key=True)
    code            = db.Column(db.String(100), nullable=False, unique=True)
    alias           = db.Column(db.String(100), nullable=True)
    email           = db.Column(db.String(200), unique=True, nullable=True)
    password        = db.Column(db.String(32), nullable=True)
    top_score       = db.Column(db.Integer, default=0)
    game_id         = db.Column(db.Integer, db.ForeignKey('game.id'))
    created         = db.Column(db.DateTime, nullable=False, default=datetime.datetime.now)
    last_seen       = db.Column(db.DateTime, nullable=True)

    @classmethod
    def find_by_code(cls, game_code):
        query = cls.query.filter(cls.code == game_code)
        return query.first()


class Game(db.Model):
    id            = db.Column(db.Integer, primary_key=True)
    users         = db.relationship('User', backref='game', lazy='dynamic')
    code          = db.Column(db.String(100), nullable=False, unique=True)
    created       = db.Column(db.DateTime, nullable=False, default=datetime.datetime.now)

    @classmethod
    def find_by_code(cls, game_code):
        query = cls.query.filter(cls.code == game_code)
        return query.first()





if __name__ == '__main__':
    db.drop_all()
    db.create_all()