#!/bin/bash
gunicorn --workers 3 --timeout 120 --bind 0.0.0.0:5000 wsgi
# gunicorn -k gevent -w 1 server:app