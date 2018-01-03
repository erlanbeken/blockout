#!/bin/bash
source ./bin/activate
gunicorn --workers 3 --timeout 120 --worker-class eventlet --access-logfile=access.log --error-logfile=error.log --bind 0.0.0.0:5000 wsgi