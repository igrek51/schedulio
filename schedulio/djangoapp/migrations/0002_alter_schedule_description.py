# Generated by Django 3.2.6 on 2022-05-26 11:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('djangoapp', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='schedule',
            name='description',
            field=models.CharField(blank=True, max_length=1024, null=True),
        ),
    ]