from datetime import date
import json

from django.contrib.auth.models import User
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import render

from home.decorators import login_required

from planner.models import Event
from .models import Friend, Invite


@login_required
def index(request):
    return render(request, "invites/index.html")


@login_required
def mail(request, mailbox):
    # Get today's date and current user
    today = date.today()
    user = request.user

    # Filter invites based on user mailbox, ignoring past events, and set order
    if mailbox == "inbox":
        invites = Invite.objects.filter(recipient=user, event__date__gte=today)
        invites = invites.order_by("-event__date")
    elif mailbox == "outbox":
        invites = Invite.objects.filter(user=user, event__date__gte=today)
        invites = invites.order_by("-timestamp")

    # Check for invites and return JSON response
    if not invites:
        return JsonResponse({"message": f"Your {mailbox} is empty!"})
    else:
        return JsonResponse([invite.serialize() for invite in invites], safe=False)


@login_required
def invite_response(request):
    if request.method == "POST":

        # Get user and invite response
        user = request.user
        data = json.loads(request.body)
        id = data.get("id")
        response = data.get("response")

        # Get invite details
        invite = Invite.objects.get(id=id)
        event_name = invite.event.event
        event_date = invite.event.date

        # If accepted, update the status
        if response == "accepted":
            message = "accepted"
            invite.accepted = True
            invite.save()

            # Create new event for user calendar
            try:
                new_event = Event(user=user, event=event_name, date=event_date)
                new_event.save()

            # If existing event, append invite note
            except IntegrityError:
                event = Event.objects.get(user=user, date=event_date)
                previous_event = event.event
                event.event = f"{previous_event} + invite!"
                event.save()

        else:
            # Else, update the status
            message = "pending"
            invite.accepted = False
            invite.save()

            # Remove event from user calendar
            try:
                event = Event.objects.get(user=user, event=event_name, date=event_date)
                event.delete()

            # If event name has been edited, remove invite note
            except Event.DoesNotExist:
                event = Event.objects.get(user=user, date=event_date)
                if event.event.endswith('+ invite!'):
                    event.event = event.event[:-10]
                    event.save()
                else:
                    pass

        # Return status message
        return JsonResponse({"message": message})


@login_required
def friends_list(request):
    # Get user's accepted friends, pending friends and friend requests
    user = request.user
    accepted_friends = Friend.objects.filter(user=user, accepted=True).order_by('friend__username')
    pending_friends = Friend.objects.filter(user=user, accepted=False)
    friend_requests = Friend.objects.filter(friend=user, accepted=False)

    # Convert objects into lists
    accepted_friends_list = [{"id": friend.friend.id, "username": friend.friend.username, "accepted": friend.accepted} for friend in accepted_friends]
    pending_friends_list = [{"id": friend.friend.id, "username": friend.friend.username, "accepted": friend.accepted} for friend in pending_friends]
    friend_requests_list = [{"id": person.user.id, "username": person.user.username} for person in friend_requests]

    # Return friends as lists
    return JsonResponse({
        "accepted_friends": accepted_friends_list,
        "pending_friends": pending_friends_list,
        "friend_requests": friend_requests_list
    })


@login_required
def events(request):
    # Get user's events
    user = request.user
    events = Event.objects.filter(user=user).order_by('date')

    # Return events as list
    events_list = [{"id": event.id, "event": event.event, "date": event.date} for event in events]
    return JsonResponse({"events_list": events_list})


@login_required
def send_invite(request):
    if request.method == "POST":

        # Get new invite details
        user = request.user
        data = json.loads(request.body)
        recipient_IDs = data.get("recipient_IDs")
        event_id = data.get("event_id")
        details = data.get("event_details")

        # Create new invite for each recipient
        for recipient_ID in recipient_IDs:
            try:
                id = recipient_ID['id']
                recipient = User.objects.get(id=id)
                event = Event.objects.get(id=event_id)
                invite = Invite(user=user, recipient=recipient, event=event, details=details)
                invite.save()

            except Exception:
                return JsonResponse({"error": "An error occurred with one or more of the invites"})

        return JsonResponse({"message": "All invites sent successfully"})


@login_required
def users(request, query):
    # Get list of other users containing given query
    current_user = request.user
    users = User.objects.raw('SELECT * FROM auth_user WHERE LOWER(username) LIKE LOWER(%s) AND id != %s ORDER BY username ASC', [query + '%', current_user.id])

    # Remove users from list if already friends with current user
    friends = Friend.objects.filter(user=current_user)
    friends_list = [friend.friend for friend in friends]
    filtered_users = [user for user in users if user not in friends_list]

    # Return users as list
    if not users:
        return JsonResponse({"message": "No users found"})
    else:
        user_list = [{"id": user.id, "username": user.username} for user in filtered_users]
        return JsonResponse({"user_list": user_list})


@login_required
def friend_update(request, id):
    if request.method == "POST":

        # Get users
        user = request.user
        friend = User.objects.get(id=id)

        # Create new friend if it does not exist
        try:
            new_friend = Friend(user=user, friend=friend)
            new_friend.save()
            return JsonResponse({"new_friend": new_friend.serialize()})

        # Otherwise delete old friend
        except IntegrityError:
            old_friend = Friend.objects.get(user=user, friend=friend)
            old_friend.delete()
            return JsonResponse({"old_friend": old_friend.serialize()})


@login_required
def request_response(request, id):
    if request.method == "POST":

        # Get users
        user = request.user
        friend = User.objects.get(id=id)

        # Get button data
        data = json.loads(request.body)
        button_ID = data.get("button_ID")

        # If declined, delete friend
        if button_ID == f"decline_{id}":
            friend_request = Friend.objects.get(user=friend, friend=user)
            friend_request.delete()
            return JsonResponse({"message": "Declined"})

        else:
            # If accepted, update friend in database
            new_friend = Friend.objects.get(user=friend, friend=user)
            new_friend.accepted = True
            new_friend.save()

            # Check if requester has been added as friend by user
            try:
                reciprocated = Friend.objects.get(user=user, friend=friend)
                return JsonResponse({"message": "Accepted & reciprocated"})
            except Friend.DoesNotExist:
                return JsonResponse({"message": "Accepted & unreciprocated"})
