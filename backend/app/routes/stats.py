from datetime import datetime, date, time
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from fastapi import APIRouter, Depends
from app.database import get_db
from app.models import SaleOrder, Product
from app.schemas import DashboardStats
from app.routes.orders import format_order_response

router = APIRouter(prefix="/stats", tags=["Dashboard Stats"])

@router.get("", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    today_start = datetime.combine(date.today(), time.min)
    
    # Today's orders
    today_orders = db.query(SaleOrder).filter(SaleOrder.created_at >= today_start).all()
    today_revenue = sum(float(order.final_amount) for order in today_orders)
    today_orders_count = len(today_orders)
    
    # Products metrics
    total_products = db.query(Product).count()
    low_stock = db.query(Product).filter(Product.stock <= Product.alert_stock).count()
    
    # Recent orders
    recent = (
        db.query(SaleOrder)
        .order_by(desc(SaleOrder.created_at))
        .limit(5)
        .all()
    )
    
    return DashboardStats(
        todayRevenue=round(today_revenue, 2),
        todayOrdersCount=today_orders_count,
        totalProductsCount=total_products,
        lowStockCount=low_stock,
        recentOrders=[format_order_response(o) for o in recent]
    )
