FROM python:3.8-slim-buster

WORKDIR /src/schedulio

COPY requirements.txt setup.py /src/schedulio/
RUN pip install -r /src/schedulio/requirements.txt

COPY static/. /src/schedulio/static/

COPY schedulio/. /src/schedulio/schedulio/
RUN cd /src/schedulio && python setup.py develop

COPY db/schedulio.sqlite /src/schedulio/db/schedulio.sqlite
RUN chmod a+rw -R /src/schedulio/db/

ENV DEBUG false
ENV DJANGO_SETTINGS_MODULE "schedulio.djangoapp.settings"
CMD python -u -m schedulio run

EXPOSE 8000
STOPSIGNAL SIGTERM
