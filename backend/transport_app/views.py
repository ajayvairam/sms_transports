from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta

from .models import Truck, TransportationOrder, Expense, MoneyTransfer, TimelineEvent
from .serializers import (
    TruckSerializer, TruckCreateSerializer,
    TransportationOrderSerializer, TransportationOrderCreateSerializer,
    ExpenseSerializer, ExpenseCreateSerializer,
    MoneyTransferSerializer, MoneyTransferCreateSerializer,
    TimelineEventSerializer, DashboardStatsSerializer
)
from users.permissions import IsAdmin, IsOwner, IsDriver, IsAdminOrOwner
from users.serializers import UserSerializer
from users.models import User

class TruckViewSet(viewsets.ModelViewSet):
    queryset = Truck.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'owner', 'assigned_driver']
    search_fields = ['truck_number', 'model', 'make']
    ordering_fields = ['truck_number', 'created_at', 'status']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']: 
            return TruckCreateSerializer
        return TruckSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return Truck.objects.all()
        elif user.role == 'owner':
            return Truck.objects.filter(owner=user)
        elif user.role == 'driver':
            return Truck.objects.filter(assigned_driver=user)
        
        return Truck.objects.none()
    
    def perform_create(self, serializer):
        truck = serializer.save()
        TimelineEvent.objects.create(
            title=f"New Truck Added: {truck.truck_number}",
            description=f"Truck {truck.truck_number} added by {self.request.user.get_full_name()}",
            event_type='order_created',
            order=None,
            created_by=self.request.user
        )
    
    @action(detail=True, methods=['post'])
    def assign_driver(self, request, pk=None):
        truck = self.get_object()
        driver_id = request.data.get('driver_id')
        
        try:
            driver = User.objects.get(id=driver_id, role='driver')
            truck.assigned_driver = driver
            truck.save()
            
            TimelineEvent.objects.create(
                title=f"Driver Assigned to Truck {truck.truck_number}",
                description=f"Driver {driver.get_full_name()} assigned to truck {truck.truck_number}",
                event_type='order_assigned',
                order=None,
                created_by=request.user
            )
            
            return Response({'detail': 'Driver assigned successfully.'})
        except User.DoesNotExist:
            return Response({'error': 'Driver not found.'}, status=status.HTTP_404_NOT_FOUND)


class TransportationOrderViewSet(viewsets.ModelViewSet):
    queryset = TransportationOrder.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'owner', 'driver', 'truck']
    search_fields = ['order_number', 'load_type', 'pickup_location', 'delivery_location']
    ordering_fields = ['created_at', 'pickup_date', 'estimated_delivery_date', 'total_amount']
    
    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            permission_classes = [IsAdmin]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsAdminOrOwner]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TransportationOrderCreateSerializer
        return TransportationOrderSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin': 
            return TransportationOrder.objects.all()
        elif user.role == 'owner':
            return TransportationOrder.objects.filter(owner=user)
        elif user.role == 'driver':
            return TransportationOrder.objects.filter(driver=user)
        
        return TransportationOrder.objects.none()
    
    def perform_create(self, serializer):
        order = serializer.save()
        
        TimelineEvent.objects.create(
            title=f"New Order Created: {order.order_number}",
            description=f"Order {order.order_number} created by {self.request.user.get_full_name()}",
            event_type='order_created',
            order=order,
            created_by=self.request.user
        )
    
    def perform_update(self, serializer):
        old_order = self.get_object()
        new_order = serializer.save()
        
        if old_order.status != new_order.status:
            TimelineEvent.objects.create(
                title=f"Order Status Changed: {new_order.order_number}",
                description=f"Status changed from {old_order.get_status_display()} to {new_order.get_status_display()}",
                event_type='order_status_changed',
                order=new_order,
                created_by=self.request.user
            )
        
        if old_order.driver != new_order.driver:
            old_driver = old_order.driver.get_full_name() if old_order.driver else "None"
            new_driver = new_order.driver.get_full_name() if new_order.driver else "None"
            TimelineEvent.objects.create(
                title=f"Driver Changed for Order: {new_order.order_number}",
                description=f"Driver changed from {old_driver} to {new_driver}",
                event_type='order_assigned',
                order=new_order,
                created_by=self.request.user
            )
    
    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        order = self.get_object()
        timeline = order.timeline.all()
        serializer = TimelineEventSerializer(timeline, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def expenses(self, request, pk=None):
        order = self.get_object()
        expenses = order.expenses.all()
        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def transfers(self, request, pk=None):
        order = self.get_object()
        transfers = order.transfers.all()
        serializer = MoneyTransferSerializer(transfers, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(order.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        old_status = order.status
        order.status = new_status
        
        if new_status == 'delivered' and not order.actual_delivery_date:
            order.actual_delivery_date = timezone.now()
        
        order.save()
        
        return Response({'detail': 'Status updated successfully.'})


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'order', 'added_by']
    search_fields = ['description']
    ordering_fields = ['date', 'amount']
    
    def get_permissions(self):
        if self.action in ['create']: 
            permission_classes = [IsDriver]
        elif self.action in ['destroy']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ExpenseCreateSerializer
        return ExpenseSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return Expense.objects.all()
        elif user.role == 'owner':
            return Expense.objects.filter(order__owner=user)
        elif user.role == 'driver': 
            return Expense.objects.filter(added_by=user)
        
        return Expense.objects.none()
    
    def perform_create(self, serializer):
        expense = serializer.save()
        
        TimelineEvent.objects.create(
            title=f"Expense Added: {expense.get_category_display()}",
            description=f"₹{expense.amount} - {expense.description}",
            event_type='expense_added',
            order=expense.order,
            related_expense=expense,
            created_by=self.request.user
        )


class MoneyTransferViewSet(viewsets.ModelViewSet):
    queryset = MoneyTransfer.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['transfer_type', 'status', 'order']
    search_fields = ['description', 'transaction_id']
    ordering_fields = ['created_at', 'amount']
    
    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = [IsAdmin]
        elif self.action in ['destroy']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MoneyTransferCreateSerializer
        return MoneyTransferSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return MoneyTransfer.objects.all()
        elif user.role == 'owner':
            return MoneyTransfer.objects.filter(order__owner=user)
        elif user.role == 'driver':
            return MoneyTransfer.objects.filter(
                Q(order__driver=user) | Q(transfer_type__in=['to_driver', 'from_driver'])
            )
        
        return MoneyTransfer.objects.none()
    
    def perform_create(self, serializer):
        transfer = serializer.save()
        
        TimelineEvent.objects.create(
            title=f"Money Transfer: {transfer.get_transfer_type_display()}",
            description=f"₹{transfer.amount} - {transfer.description}",
            event_type='money_transferred',
            order=transfer.order,
            related_transfer=transfer,
            created_by=self.request.user
        )
        
        transfer.status = 'completed'
        transfer.save()


class TimelineEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TimelineEventSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['event_type', 'order', 'created_by']
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return TimelineEvent.objects.all()
        elif user.role == 'owner':
            return TimelineEvent.objects.filter(order__owner=user)
        elif user.role == 'driver':
            return TimelineEvent.objects.filter(order__driver=user)
        
        return TimelineEvent.objects.none()


class DashboardViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user
        now = timezone.now()
        
        # Base queryset based on user role
        if user.role == 'admin':
            orders_qs = TransportationOrder.objects.all()
            expenses_qs = Expense.objects.all()
        elif user.role == 'owner':
            orders_qs = TransportationOrder.objects.filter(owner=user)
            expenses_qs = Expense.objects.filter(order__owner=user)
        elif user.role == 'driver':
            orders_qs = TransportationOrder.objects.filter(driver=user)
            expenses_qs = Expense.objects.filter(added_by=user)
        else:
            orders_qs = TransportationOrder.objects.none()
            expenses_qs = Expense.objects.none()
        
        # Calculate stats
        total_orders = orders_qs.count()
        active_orders = orders_qs.filter(status__in=['pending', 'assigned', 'in_transit']).count()
        total_revenue = orders_qs.aggregate(total=Sum('total_amount'))['total'] or 0
        pending_amount = orders_qs.aggregate(total=Sum('balance_amount'))['total'] or 0
        total_expenses = expenses_qs.aggregate(total=Sum('amount'))['total'] or 0
        total_profit = total_revenue - total_expenses
        
        # Get recent data - use serializers directly
        from .serializers import TransportationOrderSerializer, ExpenseSerializer
        
        recent_orders = orders_qs.order_by('-created_at')[:5]
        upcoming_deliveries = orders_qs.filter(
            estimated_delivery_date__gt=now,
            status__in=['pending', 'assigned', 'in_transit']
        ).order_by('estimated_delivery_date')[:5]
        recent_expenses = expenses_qs.order_by('-date')[:5]
        
        # Serialize the data
        order_serializer = TransportationOrderSerializer(recent_orders, many=True)
        upcoming_serializer = TransportationOrderSerializer(upcoming_deliveries, many=True)
        expense_serializer = ExpenseSerializer(recent_expenses, many=True)
        
        data = {
            'total_orders': total_orders,
            'active_orders': active_orders,
            'total_revenue': total_revenue,
            'pending_amount': pending_amount,
            'total_expenses': total_expenses,
            'total_profit': total_profit,
            'recent_orders': order_serializer.data,
            'upcoming_deliveries': upcoming_serializer.data,
            'recent_expenses': expense_serializer.data,
        }
        
        return Response(data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminOrOwner])
    def owner_dashboard(self, request):
        user = request.user
        owner_id = request.query_params.get('owner_id', user.id)
        now = timezone.now()
        
        if user.role == 'owner' and str(owner_id) != str(user.id):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            owner = User.objects.get(id=owner_id, role='owner')
        except User.DoesNotExist:
            return Response({'error': 'Owner not found'}, status=status.HTTP_404_NOT_FOUND)
        
        trucks = Truck.objects.filter(owner=owner)
        orders = TransportationOrder.objects.filter(owner=owner)
        orders_by_status = orders.values('status').annotate(count=Count('id'))
        
        revenue_by_month = orders.filter(
            created_at__gte=now - timedelta(days=365)
        ).extra(
            {'month': "date_trunc('month', created_at)"}
        ).values('month').annotate(total=Sum('total_amount')).order_by('month')
        
        data = {
            'owner': UserSerializer(owner).data,
            'truck_count': trucks.count(),
            'active_trucks': trucks.filter(status='available').count(),
            'orders_summary': list(orders_by_status),
            'total_orders': orders.count(),
            'total_revenue': orders.aggregate(total=Sum('total_amount'))['total'] or 0,
            'revenue_by_month': list(revenue_by_month),
        }
        
        return Response(data)