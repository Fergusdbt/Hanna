from django.contrib.auth.models import User
from django.db import models

from planner.models import Event

class Friend(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friends")
    friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name="befriended_by")
    accepted = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'friend')

    def serialize(self):
        return {
            "id": self.id,
            "user": {
                "id": self.user.id,
                "username": self.user.username,
                "email": self.user.email
            },
            "friend": {
                "id": self.friend.id,
                "username": self.friend.username,
                "email": self.friend.email
            },
            "accepted": self.accepted
        }

    def __str__(self):
        return f"Friendship {self.id}: {self.user} and {self.friend} (Accepted: {self.accepted})"


class Invite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="invites_sent")
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="invites_received")
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="invites")
    details = models.CharField(max_length=400)
    timestamp = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=False)

    class Meta:
        unique_together = ('event', 'recipient')

    def serialize(self):
        return {
            "id": self.id,
            "user": {
                "id": self.user.id,
                "username": self.user.username,
                "email": self.user.email
            },
            "recipient": {
                "id": self.recipient.id,
                "username": self.recipient.username,
                "email": self.recipient.email
            },
            "event": {
                "id": self.event.id,
                "user": {
                    "id": self.event.user.id,
                    "username": self.event.user.username,
                    "email": self.event.user.email
                },
                "event": self.event.event,
                "date": self.event.date
            },
            "details": self.details,
            "timestamp": self.timestamp,
            "accepted": self.accepted
        }

    def __str__(self):
        return f"Invite {self.id} delivered from {self.user.username} to {self.recipient.username} for {self.event.event}"
