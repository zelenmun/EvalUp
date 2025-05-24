from django.urls import path, re_path
from . import signup, login, mainview

urlpatterns = [
    re_path(r'^signup/$', signup.create_user, name='signup'),
    re_path(r'^auth/login/$', login.login_user, name='login'),
    re_path(r'^mainview/$', mainview.get_examenes, name='get_examenes'),
]