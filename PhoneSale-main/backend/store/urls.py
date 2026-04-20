from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', views.register_view, name='register'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/me/', views.me_view, name='me'),

    path('phones/', views.PhoneListCreateView.as_view(), name='phone-list'),
    path('phones/<int:pk>/', views.PhoneDetailView.as_view(), name='phone-detail'),
    path('phones/search/', views.phone_search_view, name='phone-search'),

    
    path('categories/', views.CategoryListView.as_view(), name='category-list'),


    path('cart/', views.CartView.as_view(), name='cart'),
    path('cart/<int:pk>/', views.CartItemView.as_view(), name='cart-item'),

    
    path('orders/', views.OrderListView.as_view(), name='order-list'),
    path('checkout/', views.checkout_view, name='checkout'),
]
