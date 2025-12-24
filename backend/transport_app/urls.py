from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TruckViewSet, TransportationOrderViewSet, 
    ExpenseViewSet, MoneyTransferViewSet,
    TimelineEventViewSet, DashboardViewSet
)

router = DefaultRouter()
router.register(r'trucks', TruckViewSet, basename='truck')
router.register(r'orders', TransportationOrderViewSet, basename='order')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'transfers', MoneyTransferViewSet, basename='transfer')
router.register(r'timeline', TimelineEventViewSet, basename='timeline')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]