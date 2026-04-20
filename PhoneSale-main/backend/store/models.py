from django.db import models
from django.contrib.auth.models import User



class ActivePhoneManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_available=True)

    def by_brand(self, brand):
        return self.get_queryset().filter(brand__iexact=brand)

    def in_price_range(self, min_price, max_price):
        return self.get_queryset().filter(price__gte=min_price, price__lte=max_price)



class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name




class Phone(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='phones')
    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    stock = models.PositiveIntegerField(default=0)
    image_url = models.URLField(blank=True, default='')
    ram = models.CharField(max_length=20, default='8GB')
    storage = models.CharField(max_length=20, default='128GB')
    battery = models.CharField(max_length=20, default='5000mAh')
    camera = models.CharField(max_length=50, default='50MP')
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

  
    objects = models.Manager()
    active = ActivePhoneManager()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.brand} {self.name}"



class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items')
    phone = models.ForeignKey(Phone, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'phone')

    def __str__(self):
        return f"{self.user.username} - {self.phone.name} x{self.quantity}"

    @property
    def subtotal(self):
        return self.phone.price * self.quantity



class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    shipping_address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"



class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    phone = models.ForeignKey(Phone, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.phone.name} x{self.quantity} in Order #{self.order.id}"
