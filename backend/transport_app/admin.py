# transport_app/admin.py
from django.contrib import admin
from .models import Truck, TransportationOrder, Expense, MoneyTransfer, TimelineEvent

@admin.register(Truck)
class TruckAdmin(admin.ModelAdmin):
    list_display = ('truck_number', 'model', 'make', 'owner', 'status', 'assigned_driver')
    list_filter = ('status', 'owner', 'fuel_type')
    search_fields = ('truck_number', 'model', 'make')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(TransportationOrder)
class TransportationOrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'load_type', 'pickup_location', 'delivery_location', 
                    'status', 'total_amount', 'owner', 'driver')
    list_filter = ('status', 'owner', 'driver')
    search_fields = ('order_number', 'load_type', 'pickup_location', 'delivery_location')
    readonly_fields = ('created_at', 'updated_at', 'order_number')
    date_hierarchy = 'pickup_date'

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('order', 'category', 'amount', 'date', 'added_by')
    list_filter = ('category', 'date')
    search_fields = ('description', 'order__order_number')
    readonly_fields = ('date',)

@admin.register(MoneyTransfer)
class MoneyTransferAdmin(admin.ModelAdmin):
    list_display = ('order', 'transfer_type', 'amount', 'status', 'created_at')
    list_filter = ('transfer_type', 'status')
    search_fields = ('transaction_id', 'description')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(TimelineEvent)
class TimelineEventAdmin(admin.ModelAdmin):
    list_display = ('order', 'event_type', 'title', 'created_by', 'created_at')
    list_filter = ('event_type',)
    search_fields = ('title', 'description')
    readonly_fields = ('created_at',)