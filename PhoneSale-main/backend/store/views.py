from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Category, Phone, CartItem, Order, OrderItem
from .serializers import (
    RegisterSerializer, PhoneSearchSerializer,
    CategorySerializer, PhoneSerializer,
    CartItemSerializer, OrderSerializer, UserSerializer,
)





@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """User registration endpoint."""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Registration successful.',
            'user': {'id': user.id, 'username': user.username, 'email': user.email},
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Blacklist refresh token on logout."""
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def phone_search_view(request):
    """Search/filter phones using PhoneSearchSerializer."""
    serializer = PhoneSearchSerializer(data=request.query_params)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    qs = Phone.active.all()

    if data.get('query'):
        q = data['query']
        qs = qs.filter(name__icontains=q) | qs.filter(brand__icontains=q) | qs.filter(description__icontains=q)
    if data.get('brand'):
        qs = qs.filter(brand__iexact=data['brand'])
    if data.get('category_id'):
        qs = qs.filter(category_id=data['category_id'])
    if data.get('min_price') is not None:
        qs = qs.filter(price__gte=data['min_price'])
    if data.get('max_price') is not None:
        qs = qs.filter(price__lte=data['max_price'])

    result = PhoneSerializer(qs.distinct(), many=True)
    return Response({'count': qs.distinct().count(), 'results': result.data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """Return current user profile."""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout_view(request):
    """Convert cart items into an Order. Links order to request.user."""
    shipping_address = request.data.get('shipping_address', '').strip()
    if not shipping_address:
        return Response({'error': 'Shipping address is required.'}, status=status.HTTP_400_BAD_REQUEST)

    cart_items = CartItem.objects.filter(user=request.user).select_related('phone')
    if not cart_items.exists():
        return Response({'error': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

    total = sum(item.subtotal for item in cart_items)
    order = Order.objects.create(
        user=request.user,
        total_price=total,
        shipping_address=shipping_address,
    )
    for item in cart_items:
        OrderItem.objects.create(
            order=order,
            phone=item.phone,
            quantity=item.quantity,
            price_at_purchase=item.phone.price,
        )
    cart_items.delete()

    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_201_CREATED)




class PhoneListCreateView(APIView):
    """List all available phones or create a new one (admin only)."""

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [AllowAny()]

    def get(self, request):
        phones = Phone.active.all()
        category = request.query_params.get('category')
        if category:
            phones = phones.filter(category_id=category)
        serializer = PhoneSerializer(phones, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PhoneSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PhoneDetailView(APIView):
    """Retrieve, update, or delete a phone (full CRUD)."""

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [AllowAny()]

    def get_object(self, pk):
        try:
            return Phone.objects.get(pk=pk)
        except Phone.DoesNotExist:
            return None

    def get(self, request, pk):
        phone = self.get_object(pk)
        if not phone:
            return Response({'error': 'Phone not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PhoneSerializer(phone)
        return Response(serializer.data)

    def put(self, request, pk):
        phone = self.get_object(pk)
        if not phone:
            return Response({'error': 'Phone not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PhoneSerializer(phone, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        phone = self.get_object(pk)
        if not phone:
            return Response({'error': 'Phone not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PhoneSerializer(phone, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        phone = self.get_object(pk)
        if not phone:
            return Response({'error': 'Phone not found.'}, status=status.HTTP_404_NOT_FOUND)
        phone.delete()
        return Response({'message': 'Phone deleted.'}, status=status.HTTP_204_NO_CONTENT)


class CartView(APIView):
    """Manage authenticated user's cart. Links cart items to request.user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = CartItem.objects.filter(user=request.user).select_related('phone')
        serializer = CartItemSerializer(items, many=True)
        total = sum(item.subtotal for item in items)
        return Response({'items': serializer.data, 'total': str(total), 'count': items.count()})

    def post(self, request):
        phone_id = request.data.get('phone')
        quantity = int(request.data.get('quantity', 1))
        try:
            phone = Phone.objects.get(pk=phone_id, is_available=True)
        except Phone.DoesNotExist:
            return Response({'error': 'Phone not found or unavailable.'}, status=status.HTTP_404_NOT_FOUND)

        item, created = CartItem.objects.get_or_create(
            user=request.user, phone=phone,
            defaults={'quantity': quantity}
        )
        if not created:
            item.quantity += quantity
            item.save()

        serializer = CartItemSerializer(item)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request):
        CartItem.objects.filter(user=request.user).delete()
        return Response({'message': 'Cart cleared.'}, status=status.HTTP_204_NO_CONTENT)


class CartItemView(APIView):
    """Update or remove a single cart item."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            item = CartItem.objects.get(pk=pk, user=request.user)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)
        quantity = request.data.get('quantity')
        if quantity is not None:
            item.quantity = int(quantity)
            item.save()
        serializer = CartItemSerializer(item)
        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            item = CartItem.objects.get(pk=pk, user=request.user)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)
        item.delete()
        return Response({'message': 'Item removed.'}, status=status.HTTP_204_NO_CONTENT)


class OrderListView(APIView):
    """List all orders for authenticated user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related('items__phone')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
