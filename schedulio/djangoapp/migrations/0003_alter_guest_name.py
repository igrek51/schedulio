# Generated by Django 4.0.4 on 2022-05-30 19:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('djangoapp', '0002_schedule_options'),
    ]

    operations = [
        migrations.AlterField(
            model_name='guest',
            name='name',
            field=models.CharField(blank=True, max_length=255),
        ),
    ]