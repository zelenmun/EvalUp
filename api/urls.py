from django.urls import path, re_path
from . import signup

urlpatterns = [
    re_path(r'^signup/$', signup.create_user, name='signup'),
]