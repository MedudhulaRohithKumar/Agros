import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Numeric, Boolean, DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Role(str, enum.Enum):
    ROLE_ADMIN = "ROLE_ADMIN"
    ROLE_CASHIER = "ROLE_CASHIER"

class DiscountType(str, enum.Enum):
    PERCENTAGE = "PERCENTAGE"
    FLAT = "FLAT"
    NONE = "NONE"

class PaymentMethod(str, enum.Enum):
    CASH = "CASH"
    UPI = "UPI"
    CARD = "CARD"
    CREDIT = "CREDIT"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), default=Role.ROLE_CASHIER.value, nullable=False)
    full_name = Column(String(100), default="", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    orders = relationship("SaleOrder", back_populates="user")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    mobile = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(100), nullable=True)
    address = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    orders = relationship("SaleOrder", back_populates="customer")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    barcode = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(String(50), default="Fertilizers", nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    cost_price = Column(Numeric(10, 2), nullable=True)
    stock = Column(Integer, default=0, nullable=False)
    alert_stock = Column(Integer, default=10, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    order_items = relationship("SaleOrderItem", back_populates="product")

class SaleOrder(Base):
    __tablename__ = "sale_orders"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    total_amount = Column(Numeric(10, 2), nullable=False)
    discount_type = Column(String(20), default=DiscountType.NONE.value, nullable=False)
    discount_value = Column(Numeric(10, 2), default=0.00, nullable=False)
    discount_amount = Column(Numeric(10, 2), default=0.00, nullable=False)
    final_amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(20), default=PaymentMethod.CASH.value, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    customer = relationship("Customer", back_populates="orders")
    user = relationship("User", back_populates="orders")
    items = relationship("SaleOrderItem", back_populates="sale_order", cascade="all, delete-orphan")

class SaleOrderItem(Base):
    __tablename__ = "sale_order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("sale_orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    product_name = Column(String(150), nullable=False)
    barcode = Column(String(50), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    sub_total = Column(Numeric(10, 2), nullable=False)

    sale_order = relationship("SaleOrder", back_populates="items")
    product = relationship("Product", back_populates="order_items")
