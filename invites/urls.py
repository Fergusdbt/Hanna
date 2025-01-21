from django.urls import path

from . import views

app_name = "invites"
urlpatterns = [
    path("", views.index, name="index"),

    #API routes
    path("mail/<str:mailbox>", views.mail, name="mail"),
    path("invite_response", views.invite_response, name="invite_response"),
    path("friends_list", views.friends_list, name="friends_list"),
    path("events", views.events, name="events"),
    path("send_invite", views.send_invite, name="send_invite"),
    path("users/<str:query>", views.users, name="users"),
    path("friend_update/<int:id>", views.friend_update, name="friend_update"),
    path("request_response/<int:id>", views.request_response, name="request_response")
]
