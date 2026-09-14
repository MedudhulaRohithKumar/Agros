from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models import Role, DiscountType, PaymentMethod

# ----------------- Auth Schemas -----------------
class AuthRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    full_name: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class AuthResponse(BaseModel):
    token: str
    username: str
    role: str
    full_name: Optional[str] = ""

# ----------------- Product Schemas -----------------
class ProductBase(BaseModel):
    name: str
    price: Decimal = Field(..., ge=0)
    stock: int = Field(default=0, ge=0)
    category: Optional[str] = "Fertilizers"
    cost_price: Optional[Decimal] = None
    alert_stock: Optional[int] = 10

class ProductCreate(ProductBase):
    barcode: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[Decimal] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    cost_price: Optional[Decimal] = None
    alert_stock: Optional[int] = None
    barcode: Optional[str] = None

class ProductResponse(BaseModel):
    id: int
    barcode: str
    name: str
    category: str
    price: float
    cost_price: Optional[float] = None
    stock: int
    alert_stock: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# ----------------- Customer Schemas -----------------
class CustomerBase(BaseModel):
    name: str
    mobile: str
    email: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# ----------------- Order / POS Schemas -----------------
class OrderItemRequest(BaseModel):
    productId: Optional[int] = None
    barcode: str
    quantity: int = Field(..., gt=0)

class OrderRequest(BaseModel):
    customerName: Optional[str] = "Walk-in"
    customerMobile: Optional[str] = None
    discountType: Optional[DiscountType] = DiscountType.NONE
    discountValue: Optional[Decimal] = Decimal("0.00")
    paymentMethod: Optional[PaymentMethod] = PaymentMethod.CASH
    notes: Optional[str] = None
    items: List[OrderItemRequest]

class OrderItemResponse(BaseModel):
    id: Optional[int] = None
    productName: str
    barcode: str
    quantity: int
    unitPrice: float
    subTotal: float

    model_config = ConfigDict(from_attributes=True)

class OrderResponse(BaseModel):
    id: int
    invoiceNumber: str
    createdAt: datetime
    customerName: str
    customerMobile: Optional[str] = None
    totalAmount: float
    discountType: str
    discountValue: float
    discountAmount: float
    finalAmount: float
    paymentMethod: str
    notes: Optional[str] = None
    cashier: Optional[str] = None
    items: List[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)

# ----------------- Dashboard Stats Schemas -----------------
class DashboardStats(BaseModel):
    todayRevenue: float
    todayOrdersCount: int
    totalProductsCount: int
    lowStockCount: int
    recentOrders: List[OrderResponse]
