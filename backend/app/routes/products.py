import uuid
from typing import List
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product
from app.schemas import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])

def generate_unique_barcode(db: Session) -> str:
    while True:
        code = "AG" + uuid.uuid4().hex[:8].upper()
        if not db.query(Product).filter(Product.barcode == code).first():
            return code

@router.get("", response_model=List[ProductResponse])
def get_all_products(db: Session = Depends(get_db)):
    products = db.query(Product).order_by(Product.name.asc()).all()
    return products

@router.get("/barcode/{barcode}", response_model=ProductResponse)
def get_product_by_barcode(barcode: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.barcode == barcode.strip()).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product not found with barcode: {barcode}"
        )
    return product

@router.get("/{product_id}", response_model=ProductResponse)
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product not found with ID: {product_id}"
        )
    return product

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    barcode = product_in.barcode.strip() if product_in.barcode and product_in.barcode.strip() else generate_unique_barcode(db)

    # Check for existing barcode
    existing = db.query(Product).filter(Product.barcode == barcode).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with barcode '{barcode}' already exists"
        )

    product = Product(
        barcode=barcode,
        name=product_in.name.strip(),
        category=product_in.category or "Fertilizers",
        price=Decimal(str(product_in.price)),
        cost_price=Decimal(str(product_in.cost_price)) if product_in.cost_price is not None else None,
        stock=product_in.stock,
        alert_stock=product_in.alert_stock if product_in.alert_stock is not None else 10
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product_in: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product not found with ID: {product_id}"
        )

    if product_in.name is not None:
        product.name = product_in.name.strip()
    if product_in.price is not None:
        product.price = Decimal(str(product_in.price))
    if product_in.stock is not None:
        product.stock = product_in.stock
    if product_in.category is not None:
        product.category = product_in.category
    if product_in.cost_price is not None:
        product.cost_price = Decimal(str(product_in.cost_price))
    if product_in.alert_stock is not None:
        product.alert_stock = product_in.alert_stock
    if product_in.barcode is not None and product_in.barcode.strip() != product.barcode:
        # Check duplicate
        other = db.query(Product).filter(Product.barcode == product_in.barcode.strip()).first()
        if other and other.id != product.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Barcode '{product_in.barcode}' is already in use by another product"
            )
        product.barcode = product_in.barcode.strip()

    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product not found with ID: {product_id}"
        )
    # Preserve historical invoices by unlinking foreign key
    from app.models import SaleOrderItem
    db.query(SaleOrderItem).filter(SaleOrderItem.product_id == product_id).update({"product_id": None})
    db.delete(product)
    db.commit()
    return None

