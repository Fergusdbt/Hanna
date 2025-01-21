import datetime
import json

from django.contrib import messages
from django.contrib.auth.models import User
from django.db.models import F
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from home.decorators import login_required

from .models import Item


@login_required
def index(request):
    # Get current date
    date = datetime.date.today()
    year = date.year
    next_year = year + 1

    # Get user items
    id = request.user.id
    user = User.objects.get(id=id)
    items = Item.objects.filter(user=user).order_by(F('deadline').asc(nulls_last=True))

    if request.method == "POST":
        # Get item data
        action = request.POST["action"]
        try:
            day = int(request.POST["day"])
            month = int(request.POST["month"])
            year = int(request.POST["year"])
        except ValueError:
            day = None
            month = None
            year = None

        # Check if deadline date is valid
        if month == 2:
            if day == 29 and (year % 4) != 0:
                messages.error(request, "Deadline submitted was not valid")
                return render(request, "todo/index.html", {
                    "year": year,
                    "next_year": next_year,
                    "items": items,
                    "action": action
                })

            if day == 30 or day == 31:
                messages.error(request, "Deadline submitted was not valid")
                return render(request, "todo/index.html", {
                    "year": year,
                    "next_year": next_year,
                    "items": items,
                    "action": action
                })

        if month == 4 or month == 6 or month == 9 or month == 11:
            if day == 31:
                messages.error(request, "Deadline submitted was not valid")
                return render(request, "todo/index.html", {
                    "year": year,
                    "next_year": next_year,
                    "items": items,
                    "action": action
                })

        # Check if deadline date is on or after current date
        try:
            deadline = datetime.date(year, month, day)
            if deadline < date:
                messages.error(request, "Deadline submitted has already passed")
                return render(request, "todo/index.html", {
                    "year": year,
                    "next_year": next_year,
                    "items": items,
                    "action": action
                })

        except TypeError:
            deadline = None

        # Create new item
        item = Item(user=user, action=action, deadline=deadline)
        item.save()
        return HttpResponseRedirect(reverse("todo:index"))

    else:
        # Load index page
        return render(request, "todo/index.html", {
            "year": year,
            "next_year": next_year,
            "items": items
        })

@login_required
def edit(request, id):
    # Get current date
    date = datetime.date.today()

    if request.method == "POST":
        # Get updated item data
        data = json.loads(request.body)
        new_action = data.get("action")

        try:
            new_day = int(data.get("day"))
            new_month = int(data.get("month"))
            new_year = int(data.get("year"))
        except ValueError:
            new_day = None
            new_month = None
            new_year = None

        # Check if deadline date is valid
        if new_month == 2:
            if new_day == 29 and (new_year % 4) != 0:
                return JsonResponse({"error": "Deadline submitted was not valid"})

        if new_month == 2:
            if new_day == 30 or new_day == 31:
                return JsonResponse({"error": "Deadline submitted was not valid"})

        if new_month == 4 or new_month == 6 or new_month == 9 or new_month == 11:
            if new_day == 31:
                return JsonResponse({"error": "Deadline submitted was not valid"})

        # Check if deadline date is on or after current date
        try:
            deadline = datetime.date(new_year, new_month, new_day)
            if deadline < date:
                return JsonResponse({"error": "Deadline submitted has already passed"})

        except TypeError:
            deadline = None

        # Create new item
        item = Item.objects.get(id=id)
        item.action = new_action
        item.deadline = deadline
        item.save()
        return JsonResponse(item.serialize())

    else:
        # Return item and context
        item = Item.objects.get(id=id)
        year = date.year
        next_year = year + 1
        return JsonResponse({
            "item": item.serialize(),
            "year": year,
            "next_year": next_year
        })


@login_required
def delete(request, id):
    if request.method == "POST":
        # Delete item
        item = Item.objects.get(id=id)
        deleted_item = item.serialize()
        item.delete()
        return JsonResponse(deleted_item)

    else:
        # Load index page
        return HttpResponseRedirect(reverse("todo:index"))
