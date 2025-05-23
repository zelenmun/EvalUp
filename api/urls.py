from django.urls import path, re_path
from . import signup, login

urlpatterns = [
    re_path(r'^signup/$', signup.create_user, name='signup'),
    re_path(r'^auth/login/$', login.login_user, name='login'),
]