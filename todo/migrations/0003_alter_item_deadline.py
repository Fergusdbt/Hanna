# Generated by Django 5.1.1 on 2025-01-04 18:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("todo", "0002_alter_item_action_alter_item_deadline"),
    ]

    operations = [
        migrations.AlterField(
            model_name="item",
            name="deadline",
            field=models.DateField(blank=True, null=True),
        ),
    ]
