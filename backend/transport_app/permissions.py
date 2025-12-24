from rest_framework import permissions

class IsOrderOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        elif request.user.role == 'owner':
            return obj.owner == request.user
        elif request.user.role == 'driver':
            return obj.driver == request.user
        return False

class CanAddExpense(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.role == 'driver':
            return True
        return False

class CanCreateOrder(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['admin', 'owner']

class CanCreateTransfer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'admin'