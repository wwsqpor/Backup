📱 PhoneShop

A simple full-stack phone e-commerce application built with Angular and Django REST Framework.

##  Group Members
- Member 1 — Cherepkov Dmitriy
- Member 2 — Yernazarov Madiyar
- Member 3 — Nuradin Alinur

##  Quick Start

### Backend 
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data      
python manage.py runserver      # http://localhost:8000
```

**Demo credentials:**
- Admin: `admin / admin123`
- User: `testuser / test123`

### Frontend 
```bash
cd frontend
npm install
ng serve                        # http://localhost:4200
```


## Main Features
Browse phones and view details
Search and filter by category, brand, and price
User authentication (register, login, logout)
Add and remove items from cart
Create and view orders


---

##  Structure
```
phones-shop/
├── backend/
│   ├── phoneshop/          
│   ├── store/              
│   │   └── management/commands/seed_data.py
│   ├── db.sqlite3
│   └── manage.py
├── frontend/
│   └── src/app/
│       ├── models/        
│       ├── services/       
│       ├── interceptors/   
│       ├── guards/         
│       └── components/     
├── postman/
│   └── PhoneShop.postman_collection.json
└── README.md
```

##  API Endpoints
| Method | URL | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register/` | No | Register new user |
| POST | `/api/auth/login/` | No | Login (returns JWT) |
| POST | `/api/auth/logout/` | Yes | Blacklist refresh token |
| GET | `/api/auth/me/` | Yes | Current user profile |
| GET | `/api/phones/` | No | List all available phones |
| GET | `/api/phones/:id/` | No | Phone detail |
| POST | `/api/phones/` | Admin | Create phone |
| PUT/PATCH | `/api/phones/:id/` | Admin | Update phone |
| DELETE | `/api/phones/:id/` | Admin | Delete phone |
| GET | `/api/phones/search/` | No | Search/filter phones |
| GET | `/api/categories/` | No | List categories |
| GET | `/api/cart/` | Yes | Get user's cart |
| POST | `/api/cart/` | Yes | Add item to cart |
| PATCH | `/api/cart/:id/` | Yes | Update cart item quantity |
| DELETE | `/api/cart/:id/` | Yes | Remove cart item |
| DELETE | `/api/cart/` | Yes | Clear cart |
| GET | `/api/orders/` | Yes | My orders |
| POST | `/api/checkout/` | Yes | Create order from cart |
