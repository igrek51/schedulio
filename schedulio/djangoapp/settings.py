import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DEBUG = os.environ.get('DEBUG', 'true').lower() in {'true', 'yes', 'y', '1'}

SECRET_KEY = 'x&y+a!&t&d3y+*!igjtgrf_^&h&kj=(+)fuv9(a#qa1+ge$r0e'

ALLOWED_HOSTS = ['*']


INSTALLED_APPS = [
    'schedulio.djangoapp.apps.DjangoAppConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'schedulio.djangoapp.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'db/schedulio.sqlite',
    }
}


LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Europe/Warsaw'
USE_TZ = True

USE_I18N = True
USE_L10N = True

STATIC_URL = '/static/'

LOGIN_URL = '/admin/login/'

CSRF_TRUSTED_ORIGINS = [
    os.environ.get('DJANGO_CSRF_TRUSTED_ORIGIN', ''),
]
