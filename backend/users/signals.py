from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from .models import User

@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    if created:
        # Send welcome email to new users
        try:
            send_mail(
                'Welcome to SMS Transports',
                f'Hello {instance.first_name},\n\nYour account has been created successfully.\n\nUsername: {instance.email}\nRole: {instance.get_role_display()}\n\nThank you for joining SMS Transports!',
                'admin@smstransports.com',
                [instance.email],
                fail_silently=True,
            )
        except:
            # Email sending failed, but don't break the user creation
            pass

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        # You can add profile creation logic here if needed
        pass