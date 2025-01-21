from django.urls import path

from . import views

app_name = "planner"
urlpatterns = [
    path("", views.index, name="index"),

    #API routes
    path("date", views.date, name="date"),
    path("month/<int:year>/<int:month>", views.month, name="month"),
    path("actions/<str:date>", views.actions, name="actions"),
    path("event/<str:date>", views.event, name="event")
]
