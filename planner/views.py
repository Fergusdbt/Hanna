import calendar
import datetime
import json

from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import render

from home.decorators import login_required

from todo.models import Item
from .models import Event


@login_required
def index(request):
    return render(request, "planner/index.html")


@login_required
def date(request):
    # Get current date
    current_date = datetime.date.today()
    day = current_date.day
    month = current_date.month
    year = current_date.year
    return JsonResponse({
        "day": day,
        "month": month,
        "year": year
    })


@login_required
def month(request, year, month):
    # Get dates for calendar month including the day of the week
    days = list(calendar.Calendar().itermonthdays(year, month))
    return JsonResponse({
        "days": days
    })


@login_required
def actions(request, date):
    # Get user actions from to do list database for given date
    user = request.user
    items = Item.objects.filter(user=user, deadline=date).values('action')
    return JsonResponse({
        "items": list(items)
    })


@login_required
def event(request, date):
    # Get user id
    user = request.user

    if request.method == "POST":
        # Get new event description to update database on given date
        data = json.loads(request.body)
        new_event = data.get("event")

        # Handle new event if one already exists on given date
        try:
            previous_event = Event.objects.get(user=user, date=date)

            # Delete previous event if new event is empty string
            if new_event == "":
                previous_event.delete()
                return JsonResponse({
                    "message": "Previous event has been deleted"
                })

            else:
                # Update previous event with new event provided
                previous_event.event = new_event
                previous_event.save()
                return JsonResponse({
                    "event": previous_event.serialize()
                })

        # Handle new event if previous event does not exist on given date
        except Event.DoesNotExist:

            # Check if new event is empty string
            if new_event == "":
                return JsonResponse({
                    "message": "No event provided"
                })

            else:
                # Create new event
                event = Event(user=user, event=new_event, date=date)
                event.save()
                return JsonResponse({
                    "event": event.serialize()
                })

    else:
        # Get user event description from database for given date
        try:
            event = Event.objects.get(user=user, date=date)
            return JsonResponse({
                "event": event.serialize()
            })
        except Event.DoesNotExist:
            return JsonResponse({
                "message": "No event on this date"
            })
