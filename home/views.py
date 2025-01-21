from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.http import HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse

from .decorators import login_required


@login_required
def index(request):
    return render(request, "home/index.html")


def login_view(request):
    if request.method == "POST":

        # Authenticate log in details
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication was successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("home:index"))
        else:
            messages.error(request, "Invalid username and/or password")
            return render(request, "home/login.html")

    else:
        return render(request, "home/login.html")


def logout_view(request):
    # Log out user and redirect to home page
    logout(request)
    return HttpResponseRedirect(reverse("home:index"))


def register(request):
    if request.method == "POST":
        # Check password matches password confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            messages.error(request, "Passwords do not match")
            return render(request, "home/register.html")

        # Check password is at least 8 characters
        if len(password) < 8:
            messages.error(request, "Password must contain 8+ characters")
            return render(request, "home/register.html")

        # Try to create new user
        username = request.POST["username"]
        email = request.POST["email"]
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            messages.error(request, "Username already exists")
            return render(request, "home/register.html")

        # Redirect new user to log in page
        messages.success(request, "You have successfully registered!")
        return redirect(reverse("home:login"))

    else:
        return render(request, "home/register.html")
