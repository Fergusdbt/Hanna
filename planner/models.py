from django.contrib.auth.models import User
from django.db import models

class Event(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="events")
    event = models.CharField(max_length=24, blank=False)
    date = models.DateField()

    class Meta:
        unique_together = ('user', 'date')

    def serialize(self):
        return {
            "id": self.id,
            "user": {
                "id": self.user.id,
                "username": self.user.username
            },
            "event": self.event,
            "date": self.date
        }

    def __str__(self):
        return f"Event {self.id} for {self.user}: {self.event} on {self.date}"
