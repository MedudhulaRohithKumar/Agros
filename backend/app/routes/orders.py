from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models import SaleOrder, SaleOrderItem, Product, Customer, User, DiscountType, PaymentMethod
from app.schemas import OrderRequest, OrderResponse, OrderItemResponse
from app.auth import get_current_user, security

router = APIRouter(prefix="/orders", tags=["Orders / POS"])

def generate_invoice_number(db: Session) -> str:
    now = datetime.utcnow()
    prefix = f"INV-{now.strftime('%Y%m')}-"
    last_order = (
        db.query(SaleOrder)
        .filter(SaleOrder.invoice_number.like(f"{prefix}%"))
        .order_by(desc(SaleOrder.id))
        .first()
    )
    if last_order and last_order.invoice_number:
        try:
            seq = int(last_order.invoice_number.split("-")[-1]) + 1
        except ValueError:
            seq = 1
    else:
        seq = 1
    return f"{prefix}{seq:04d}"

def format_order_response(order: SaleOrder) -> OrderResponse:
    item_responses = [
        OrderItemResponse(
            id=item.id,
            productName=item.product_name,
            barcode=item.barcode,
            quantity=item.quantity,
            unitPrice=float(item.unit_price),
            subTotal=float(item.sub_total),
        )
        for item in order.items
    ]

    return OrderResponse(
        id=order.id,
        invoiceNumber=order.invoice_number or f"INV-{order.id:06d}",
        createdAt=order.created_at or datetime.utcnow(),
        customerName=order.customer.name if order.customer else "Walk-in",
        customerMobile=order.customer.mobile if order.customer else None,
        totalAmount=float(order.total_amount),
        discountType=order.discount_type,
        discountValue=float(order.discount_value),
        discountAmount=float(order.discount_amount),
        finalAmount=float(order.final_amount),
        paymentMethod=order.payment_method,
        notes=order.notes,
        cashier=order.user.full_name if order.user else (order.user.username if order.user else "Staff"),
        items=item_responses
    )

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    request: OrderRequest,
    db: Session = Depends(get_db),
    credentials = Depends(security)
):
    # Optional cashier attribution if logged in
    user_id = None
    if credentials:
        try:
            from app.auth import get_current_user
            user = get_current_user(credentials, db)
            user_id = user.id
        except Exception:
            pass

    if not request.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item"
        )

    # 1. Handle Customer
    customer = None
    if request.customerMobile and request.customerMobile.strip():
        mobile = request.customerMobile.strip()
        customer = db.query(Customer).filter(Customer.mobile == mobile).first()
        if not customer:
            customer = Customer(
                name=request.customerName.strip() if request.customerName and request.customerName.strip() else "Walk-in Customer",
                mobile=mobile
            )
            db.add(customer)
            db.commit()
            db.refresh(customer)
        elif request.customerName and request.customerName.strip() and customer.name == "Walk-in Customer":
            customer.name = request.customerName.strip()
            db.commit()

    # 2. Process Items and verify inventory atomically
    total_amount = Decimal("0.00")
    order_items_to_create = []

    for item_req in request.items:
        product = db.query(Product).filter(Product.barcode == item_req.barcode.strip()).first()
        if not product and item_req.productId:
            product = db.query(Product).filter(Product.id == item_req.productId).first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product not found with barcode: {item_req.barcode}"
            )

        if product.stock < item_req.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'. In stock: {product.stock}, requested: {item_req.quantity}"
            )

        # Deduct stock
        product.stock -= item_req.quantity

        unit_price = Decimal(str(product.price))
        sub_total = unit_price * item_req.quantity
        total_amount += sub_total

        order_items_to_create.append({
            "product": product,
            "quantity": item_req.quantity,
            "unit_price": unit_price,
            "sub_total": sub_total,
        })

    # 3. Calculate Discount
    raw_discount_type = request.discountType or DiscountType.NONE
    discount_type_str = (raw_discount_type.value if hasattr(raw_discount_type, "value") else str(raw_discount_type)).upper()
    if "PERCENT" in discount_type_str:
        normalized_discount_type = "PERCENTAGE"
    elif "FLAT" in discount_type_str:
        normalized_discount_type = "FLAT"
    else:
        normalized_discount_type = "NONE"

    discount_value = Decimal(str(request.discountValue or 0))
    discount_amount = Decimal("0.00")

    if normalized_discount_type == "PERCENTAGE":
        discount_amount = (total_amount * discount_value / Decimal("100")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    elif normalized_discount_type == "FLAT":
        discount_amount = min(total_amount, discount_value)

    final_amount = max(Decimal("0.00"), total_amount - discount_amount)

    # 4. Create Sale Order
    invoice_no = generate_invoice_number(db)
    order = SaleOrder(
        invoice_number=invoice_no,
        customer_id=customer.id if customer else None,
        user_id=user_id,
        total_amount=total_amount,
        discount_type=normalized_discount_type,
        discount_value=discount_value,
        discount_amount=discount_amount,
        final_amount=final_amount,
        payment_method=request.paymentMethod.value if request.paymentMethod and hasattr(request.paymentMethod, "value") else str(request.paymentMethod or "CASH").upper(),
        notes=request.notes
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # 5. Create Order Items
    for item_data in order_items_to_create:
        item = SaleOrderItem(
            order_id=order.id,
            product_id=item_data["product"].id,
            product_name=item_data["product"].name,
            barcode=item_data["product"].barcode,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            sub_total=item_data["sub_total"],
        )
        db.add(item)

    db.commit()
    db.refresh(order)

    return format_order_response(order)

@router.get("", response_model=List[OrderResponse])
def get_all_orders(limit: int = 50, db: Session = Depends(get_db)):
    orders = (
        db.query(SaleOrder)
        .order_by(desc(SaleOrder.created_at))
        .limit(limit)
        .all()
    )
    return [format_order_response(order) for order in orders]

@router.get("/{order_id}", response_model=OrderResponse)
def get_order_by_id(order_id: int, db: Session = Depends(get_db)):
    order = db.query(SaleOrder).filter(SaleOrder.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order not found with ID: {order_id}"
        )
    return format_order_response(order)
