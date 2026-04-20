from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Phone, CartItem, Order, OrderItem




class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        return user


class PhoneSearchSerializer(serializers.Serializer):
    query = serializers.CharField(required=False, allow_blank=True)
    min_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    max_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    brand = serializers.CharField(required=False, allow_blank=True)
    category_id = serializers.IntegerField(required=False)




class CategorySerializer(serializers.ModelSerializer):
    phone_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'phone_count', 'created_at']

    def get_phone_count(self, obj):
        return obj.phones.filter(is_available=True).count()


class PhoneSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Phone
        fields = [
            'id', 'category', 'category_name', 'name', 'brand', 'model',
            'price', 'description', 'stock', 'image_url',
            'ram', 'storage', 'battery', 'camera',
            'is_available', 'created_at', 'updated_at',
        ]


class CartItemSerializer(serializers.ModelSerializer):
    phone_name = serializers.CharField(source='phone.name', read_only=True)
    phone_brand = serializers.CharField(source='phone.brand', read_only=True)
    phone_price = serializers.DecimalField(source='phone.price', max_digits=10, decimal_places=2, read_only=True)
    phone_image = serializers.CharField(source='phone.image_url', read_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id', 'phone', 'phone_name', 'phone_brand', 'phone_price', 'phone_image', 'quantity', 'subtotal', 'added_at']
        read_only_fields = ['user']


class OrderItemSerializer(serializers.ModelSerializer):
    phone_name = serializers.CharField(source='phone.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'phone', 'phone_name', 'quantity', 'price_at_purchase']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'username', 'status', 'total_price', 'shipping_address', 'items', 'created_at', 'updated_at']
        read_only_fields = ['user', 'total_price']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
