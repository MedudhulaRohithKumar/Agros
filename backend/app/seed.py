from decimal import Decimal
from sqlalchemy.orm import Session
from app.models import User, Role, Product, Customer, SaleOrder, SaleOrderItem, DiscountType, PaymentMethod
from app.auth import hash_password

def seed_database(db: Session):
    # 1. Seed Users
    if db.query(User).count() == 0:
        admin_user = User(
            username="admin",
            password=hash_password("password123"),
            role=Role.ROLE_ADMIN.value,
            full_name="Agros Admin",
            is_active=True
        )
        cashier_user = User(
            username="cashier",
            password=hash_password("cashier123"),
            role=Role.ROLE_CASHIER.value,
            full_name="Main Counter Cashier",
            is_active=True
        )
        db.add_all([admin_user, cashier_user])
        db.commit()
        print("🌱 Seeded initial Admin and Cashier accounts.")

    # 2. Seed Sample Products
    if db.query(Product).count() == 0:
        sample_products = [
            Product(
                barcode="AG001",
                name="Urea 46% Nitrogen (45kg)",
                category="Chemical Fertilizer",
                price=Decimal("266.50"),
                cost_price=Decimal("240.00"),
                stock=150,
                alert_stock=20
            ),
            Product(
                barcode="AG002",
                name="DAP 18-46-0 Fertilizer (50kg)",
                category="Phosphatic Fertilizer",
                price=Decimal("1350.00"),
                cost_price=Decimal("1250.00"),
                stock=85,
                alert_stock=15
            ),
            Product(
                barcode="AG003",
                name="NPK 20-20-0-13 Complex (50kg)",
                category="Complex Fertilizer",
                price=Decimal("1200.00"),
                cost_price=Decimal("1100.00"),
                stock=60,
                alert_stock=10
            ),
            Product(
                barcode="AG004",
                name="MOP Potash 60% K2O (50kg)",
                category="Potassic Fertilizer",
                price=Decimal("1700.00"),
                cost_price=Decimal("1550.00"),
                stock=40,
                alert_stock=10
            ),
            Product(
                barcode="AG005",
                name="Zinc Sulphate 33% (5kg)",
                category="Micronutrients",
                price=Decimal("450.00"),
                cost_price=Decimal("380.00"),
                stock=100,
                alert_stock=25
            ),
            Product(
                barcode="AG006",
                name="Organic Bio-Potash Liquid (1L)",
                category="Bio-Fertilizer",
                price=Decimal("380.00"),
                cost_price=Decimal("300.00"),
                stock=75,
                alert_stock=15
            ),
            Product(
                barcode="AG007",
                name="Neem Cake Organic Manure (25kg)",
                category="Organic Manure",
                price=Decimal("620.00"),
                cost_price=Decimal("520.00"),
                stock=5,  # Low stock test item
                alert_stock=10
            ),
        ]
        db.add_all(sample_products)
        db.commit()
        print("🌱 Seeded initial fertilizer catalog.")

    # 3. Seed Sample Customer and Order if empty
    if db.query(SaleOrder).count() == 0:
        customer = Customer(
            name="Ramesh Patel",
            mobile="9876543210",
            email="ramesh.farmer@example.com",
            address="Green Valley Farm, Sector 4"
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

        admin = db.query(User).filter(User.username == "admin").first()
        prod1 = db.query(Product).filter(Product.barcode == "AG001").first()
        prod2 = db.query(Product).filter(Product.barcode == "AG005").first()

        if prod1 and prod2:
            subtotal = (prod1.price * 2) + (prod2.price * 1)
            order = SaleOrder(
                invoice_number="INV-202609-0001",
                customer_id=customer.id,
                user_id=admin.id if admin else None,
                total_amount=subtotal,
                discount_type=DiscountType.NONE.value,
                discount_value=Decimal("0.00"),
                discount_amount=Decimal("0.00"),
                final_amount=subtotal,
                payment_method=PaymentMethod.UPI.value,
                notes="Early season soil preparation"
            )
            db.add(order)
            db.commit()
            db.refresh(order)

            item1 = SaleOrderItem(
                order_id=order.id,
                product_id=prod1.id,
                product_name=prod1.name,
                barcode=prod1.barcode,
                quantity=2,
                unit_price=prod1.price,
                sub_total=prod1.price * 2
            )
            item2 = SaleOrderItem(
                order_id=order.id,
                product_id=prod2.id,
                product_name=prod2.name,
                barcode=prod2.barcode,
                quantity=1,
                unit_price=prod2.price,
                sub_total=prod2.price * 1
            )
            db.add_all([item1, item2])
            db.commit()
            print("🌱 Seeded initial demo order & invoice.")
