from django.shortcuts import redirect
from django.urls import path
from django.contrib import admin

from schedulio.djangoapp.dump import dump_database
from schedulio.djangoapp.staticfiles import staticfiles_urlpatterns

urlpatterns = [
    path('', lambda req: redirect('admin/')),
    path('admin/', admin.site.urls),
    path('dump/', dump_database),
] + staticfiles_urlpatterns()
