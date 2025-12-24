from rest_framework import serializers
from .models import Truck, TransportationOrder, Expense, MoneyTransfer, TimelineEvent
from users.serializers import UserSerializer

class TruckSerializer(serializers.ModelSerializer):
    owner_detail = UserSerializer(source='owner', read_only=True)
    driver_detail = UserSerializer(source='assigned_driver', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Truck
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class TruckCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Truck
        fields = '__all__'
    
    def validate(self, data):
        from django.utils import timezone
        today = timezone.now().date()
        
        if data.get('rc_expiry') and data['rc_expiry'] < today: 
            raise serializers.ValidationError("RC has already expired.")
        
        if data.get('insurance_expiry') and data['insurance_expiry'] < today:
            raise serializers.ValidationError("Insurance has already expired.")
        
        if data.get('pollution_expiry') and data['pollution_expiry'] < today:
            raise serializers.ValidationError("Pollution certificate has already expired.")
        
        return data

class TransportationOrderSerializer(serializers.ModelSerializer):
    truck_detail = TruckSerializer(source='truck', read_only=True)
    driver_detail = UserSerializer(source='driver', read_only=True)
    owner_detail = UserSerializer(source='owner', read_only=True)
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = TransportationOrder
        fields = '__all__'
        read_only_fields = ('order_number', 'created_at', 'updated_at', 'balance_amount')

class TransportationOrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportationOrder
        exclude = ('created_by',)
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate(self, data):
        if data.get('pickup_date') and data.get('estimated_delivery_date'):
            if data['estimated_delivery_date'] <= data['pickup_date']:
                raise serializers.ValidationError("Estimated delivery date must be after pickup date.")
        
        if data.get('total_amount') and data.get('advance_amount'):
            if data['advance_amount'] > data['total_amount']:
                raise serializers.ValidationError("Advance amount cannot be greater than total amount.")
        
        return data

class ExpenseSerializer(serializers.ModelSerializer):
    added_by_detail = UserSerializer(source='added_by', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ('date', 'added_by')

class ExpenseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        exclude = ('added_by',)
    
    def create(self, validated_data):
        validated_data['added_by'] = self.context['request'].user
        return super().create(validated_data)

class MoneyTransferSerializer(serializers.ModelSerializer):
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    transfer_type_display = serializers.CharField(source='get_transfer_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    
    class Meta:
        model = MoneyTransfer
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at')

class MoneyTransferCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoneyTransfer
        exclude = ('created_by',)
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate(self, data):
        order = data['order']
        
        if data['transfer_type'] == 'to_driver':
            if not order.driver:
                raise serializers.ValidationError("No driver assigned to this order.")
        elif data['transfer_type'] in ['to_owner', 'from_owner']:
            if not order.owner:
                raise serializers.ValidationError("No owner assigned to this order.")
        
        return data

class TimelineEventSerializer(serializers.ModelSerializer):
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    
    class Meta:
        model = TimelineEvent
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at')

class DashboardStatsSerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    active_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    pending_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_profit = serializers.DecimalField(max_digits=12, decimal_places=2)
    recent_orders = serializers.ListField()
    upcoming_deliveries = serializers.ListField()
    recent_expenses = serializers.ListField()