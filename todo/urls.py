from django.urls import path

from . import views

app_name = "todo"
urlpatterns = [
    path("", views.index, name="index"),

    #API routes
    path("edit/<int:id>", views.edit, name="edit"),
    path("delete/<int:id>", views.delete, name="delete")
]
