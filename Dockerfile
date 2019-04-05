FROM tiangolo/uwsgi-nginx-flask:python2.7
WORKDIR /app
COPY . /app
RUN pip install --trusted-host pypi.python.org -r requirements.txt
EXPOSE 8080
COPY blockout.conf /etc/nginx/conf.d/default.conf
