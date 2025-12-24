# transport_app/models.py - FIXED VERSION
from django.db import models
from django.core.validators import MinValueValidator
from users.models import User

class Truck(models.Model):
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('on_trip', 'On Trip'),
        ('maintenance', 'Maintenance'),
        ('out_of_service', 'Out of Service'),
    )
    
    truck_number = models.CharField(max_length=20, unique=True)
    model = models.CharField(max_length=50)
    make = models.CharField(max_length=50)
    year = models.IntegerField()
    axle_count = models.IntegerField(default=2, validators=[MinValueValidator(2)])
    
    rc_document = models.FileField(upload_to='documents/rc/', null=True, blank=True)
    rc_expiry = models.DateField()
    
    insurance_document = models.FileField(upload_to='documents/insurance/', null=True, blank=True)
    insurance_expiry = models.DateField()
    
    pollution_certificate = models.FileField(upload_to='documents/pollution/', null=True, blank=True)
    pollution_expiry = models.DateField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'owner'}, related_name='owned_trucks')
    assigned_driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                       limit_choices_to={'role': 'driver'}, related_name='assigned_trucks')
    
    capacity = models.DecimalField(max_digits=10, decimal_places=2, help_text="Capacity in tons")
    fuel_type = models.CharField(max_length=20, default='diesel')
    current_mileage = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.truck_number} - {self.model}"
    
    def get_status_display(self):
        return dict(self.STATUS_CHOICES).get(self.status, self.status)


class TransportationOrder(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    
    order_number = models.CharField(max_length=20, unique=True, blank=True)
    description = models.TextField()
    
    pickup_location = models.CharField(max_length=255)
    pickup_contact = models.CharField(max_length=100)
    pickup_phone = models.CharField(max_length=15)
    
    delivery_location = models.CharField(max_length=255)
    delivery_contact = models.CharField(max_length=100)
    delivery_phone = models.CharField(max_length=15)
    
    pickup_date = models.DateTimeField()
    estimated_delivery_date = models.DateTimeField()
    actual_delivery_date = models.DateTimeField(null=True, blank=True)
    
    load_type = models.CharField(max_length=100)
    weight = models.DecimalField(max_digits=10, decimal_places=2)
    volume = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    advance_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    truck = models.ForeignKey(Truck, on_delete=models.SET_NULL, null=True, blank=True)
    driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                              limit_choices_to={'role': 'driver'}, related_name='driver_orders')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owner_orders',
                             limit_choices_to={'role': 'owner'})
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    waybill = models.FileField(upload_to='documents/waybills/', null=True, blank=True)
    lr_copy = models.FileField(upload_to='documents/lr/', null=True, blank=True)
    other_documents = models.FileField(upload_to='documents/other/', null=True, blank=True)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_orders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order_number} - {self.load_type}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate order number
            import random
            self.order_number = f"TRANS{random.randint(100000, 999999)}"
            # Check if unique
            while TransportationOrder.objects.filter(order_number=self.order_number).exists():
                self.order_number = f"TRANS{random.randint(100000, 999999)}"
        
        if self.total_amount and self.advance_amount:
            self.balance_amount = self.total_amount - self.advance_amount
        
        super().save(*args, **kwargs)
    
    def get_status_display(self):
        return dict(self.STATUS_CHOICES).get(self.status, self.status)


class Expense(models.Model):
    CATEGORY_CHOICES = (
        ('fuel', 'Fuel'),
        ('toll', 'Toll'),
        ('maintenance', 'Maintenance'),
        ('food', 'Food'),
        ('accommodation', 'Accommodation'),
        ('other', 'Other'),
    )
    
    order = models.ForeignKey(TransportationOrder, on_delete=models.CASCADE, related_name='expenses')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    bill_photo = models.FileField(upload_to='expenses/bills/', null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    added_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.order.order_number} - {self.category}: ₹{self.amount}"
    
    def get_category_display(self):
        return dict(self.CATEGORY_CHOICES).get(self.category, self.category)


class MoneyTransfer(models.Model):
    TRANSFER_TYPE_CHOICES = (
        ('to_driver', 'To Driver'),
        ('from_driver', 'From Driver'),
        ('to_owner', 'To Owner'),
        ('from_owner', 'From Owner'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    
    order = models.ForeignKey(TransportationOrder, on_delete=models.CASCADE, related_name='transfers')
    transfer_type = models.CharField(max_length=20, choices=TRANSFER_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    transaction_id = models.CharField(max_length=100, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    account_number = models.CharField(max_length=50, blank=True)
    ifsc_code = models.CharField(max_length=20, blank=True)
    
    receipt = models.FileField(upload_to='transfers/receipts/', null=True, blank=True)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order.order_number} - {self.transfer_type}: ₹{self.amount}"
    
    def get_transfer_type_display(self):
        return dict(self.TRANSFER_TYPE_CHOICES).get(self.transfer_type, self.transfer_type)
    
    def get_status_display(self):
        return dict(self.STATUS_CHOICES).get(self.status, self.status)


class TimelineEvent(models.Model):
    EVENT_TYPE_CHOICES = (
        ('order_created', 'Order Created'),
        ('order_assigned', 'Order Assigned'),
        ('order_status_changed', 'Order Status Changed'),
        ('expense_added', 'Expense Added'),
        ('money_transferred', 'Money Transferred'),
        ('document_uploaded', 'Document Uploaded'),
        ('trip_started', 'Trip Started'),
        ('trip_completed', 'Trip Completed'),
    )
    
    order = models.ForeignKey(TransportationOrder, on_delete=models.CASCADE, related_name='timeline')
    event_type = models.CharField(max_length=30, choices=EVENT_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    related_expense = models.ForeignKey(Expense, on_delete=models.SET_NULL, null=True, blank=True)
    related_transfer = models.ForeignKey(MoneyTransfer, on_delete=models.SET_NULL, null=True, blank=True)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order.order_number} - {self.title}"
    
    def get_event_type_display(self):
        return dict(self.EVENT_TYPE_CHOICES).get(self.event_type, self.event_type)