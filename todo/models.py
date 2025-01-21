from django.contrib.auth.models import User
from django.db import models

class Item(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="items")
    action = models.CharField(max_length=28)
    deadline = models.DateField(blank=True, null=True)

    def serialize(self):
        return {
            "id": self.id,
            "user": {
                "id": self.user.id,
                "username": self.user.username
            },
            "action": self.action,
            "deadline": self.deadline
        }

    def __str__(self):
        return f"{self.id}: {self.user} to {self.action} by {self.deadline}"
