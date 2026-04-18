# backend/routers/transactions.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, extract, func, case
from typing import Optional
from datetime import date
from database import get_db
import models, schemas

router = APIRouter(prefix="/transactions", tags=["transactions"])


# ─── List with filters ────────────────────────────────────────────────
@router.get("/", response_model=list[schemas.TransactionOut])
def list_transactions(
    db:          Session        = Depends(get_db),
    account_id:  Optional[int]  = None,
    category_id: Optional[int]  = None,
    type:        Optional[str]  = None,
    date_from:   Optional[date] = None,
    date_to:     Optional[date] = None,
    search:      Optional[str]  = None,
    limit:       int            = Query(default=50, ge=1, le=500),
    offset:      int            = Query(default=0,  ge=0),
):
    q = db.query(models.Transaction)
    filters = []
    if account_id:  filters.append(models.Transaction.account_id  == account_id)
    if category_id: filters.append(models.Transaction.category_id == category_id)
    if type:        filters.append(models.Transaction.type         == type)
    if date_from:   filters.append(models.Transaction.date         >= date_from)
    if date_to:     filters.append(models.Transaction.date         <= date_to)
    if search:      filters.append(models.Transaction.description.ilike(f"%{search}%"))
    if filters:
        q = q.filter(and_(*filters))
    return (
        q.order_by(models.Transaction.date.desc(), models.Transaction.id.desc())
        .offset(offset).limit(limit).all()
    )


# ─── Create ───────────────────────────────────────────────────────────
@router.post("/", response_model=schemas.TransactionOut, status_code=201)
def create_transaction(body: schemas.TransactionCreate, db: Session = Depends(get_db)):
    tx = models.Transaction(**body.model_dump())
    db.add(tx)
    account = db.query(models.Account).filter(models.Account.id == body.account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    if body.type == "income":
        account.balance += body.amount
    elif body.type == "expense":
        account.balance -= body.amount
    db.commit()
    db.refresh(tx)
    return tx


# ─── Get one ──────────────────────────────────────────────────────────
@router.get("/{tx_id}", response_model=schemas.TransactionOut)
def get_transaction(tx_id: int, db: Session = Depends(get_db)):
    tx = db.query(models.Transaction).filter(models.Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


# ─── Update ───────────────────────────────────────────────────────────
@router.patch("/{tx_id}", response_model=schemas.TransactionOut)
def update_transaction(tx_id: int, body: schemas.TransactionUpdate, db: Session = Depends(get_db)):
    tx = db.query(models.Transaction).filter(models.Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Reverse old balance effect
    account = db.query(models.Account).filter(models.Account.id == tx.account_id).first()
    if account:
        if tx.type == "income":   account.balance -= tx.amount
        elif tx.type == "expense": account.balance += tx.amount

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(tx, field, value)

    # Apply new balance effect
    if account:
        if tx.type == "income":   account.balance += tx.amount
        elif tx.type == "expense": account.balance -= tx.amount

    db.commit()
    db.refresh(tx)
    return tx


# ─── Delete ───────────────────────────────────────────────────────────
@router.delete("/{tx_id}", status_code=204)
def delete_transaction(tx_id: int, db: Session = Depends(get_db)):
    tx = db.query(models.Transaction).filter(models.Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    account = db.query(models.Account).filter(models.Account.id == tx.account_id).first()
    if account:
        if tx.type == "income":   account.balance -= tx.amount
        elif tx.type == "expense": account.balance += tx.amount
    db.delete(tx)
    db.commit()


# ─── Bulk CSV import ──────────────────────────────────────────────────
@router.post("/bulk", response_model=list[schemas.TransactionOut], status_code=201)
def bulk_create(body: schemas.TransactionBulkCreate, db: Session = Depends(get_db)):
    created = []
    for item in body.transactions:
        tx = models.Transaction(**item.model_dump())
        db.add(tx)
        account = db.query(models.Account).filter(models.Account.id == item.account_id).first()
        if account:
            if item.type == "income":   account.balance += item.amount
            elif item.type == "expense": account.balance -= item.amount
        created.append(tx)
    db.commit()
    for tx in created:
        db.refresh(tx)
    return created


# ─── Monthly summary ──────────────────────────────────────────────────
@router.get("/analytics/monthly", response_model=list[schemas.MonthlySummary])
def monthly_summary(
    year:       int           = Query(default=2025),
    account_id: Optional[int] = None,
    db:         Session       = Depends(get_db),
):
    q = db.query(
        extract("month", models.Transaction.date).label("month"),
        func.sum(
            case((models.Transaction.type == "income",  models.Transaction.amount), else_=0)
        ).label("income"),
        func.sum(
            case((models.Transaction.type == "expense", models.Transaction.amount), else_=0)
        ).label("expenses"),
    ).filter(extract("year", models.Transaction.date) == year)
    if account_id:
        q = q.filter(models.Transaction.account_id == account_id)
    rows = q.group_by("month").order_by("month").all()
    return [
        {
            "month":    int(r.month),
            "income":   float(r.income   or 0),
            "expenses": float(r.expenses or 0),
            "net":      float((r.income or 0) - (r.expenses or 0)),
        }
        for r in rows
    ]


# ─── Spending by category ─────────────────────────────────────────────
@router.get("/analytics/by-category", response_model=list[schemas.CategorySpend])
def spending_by_category(
    date_from:  Optional[date] = None,
    date_to:    Optional[date] = None,
    account_id: Optional[int]  = None,
    db:         Session        = Depends(get_db),
):
    q = db.query(
        models.Transaction.category_id,
        models.Category.name.label("category_name"),
        models.Category.colour,
        func.sum(models.Transaction.amount).label("total"),
    ).outerjoin(
        models.Category, models.Transaction.category_id == models.Category.id
    ).filter(models.Transaction.type == "expense")

    if date_from:  q = q.filter(models.Transaction.date >= date_from)
    if date_to:    q = q.filter(models.Transaction.date <= date_to)
    if account_id: q = q.filter(models.Transaction.account_id == account_id)

    rows = q.group_by(
        models.Transaction.category_id,
        models.Category.name,
        models.Category.colour,
    ).order_by(func.sum(models.Transaction.amount).desc()).all()

    total_all = sum(float(r.total) for r in rows) or 1

    return [
        {
            "category_id": r.category_id,
            "category":    r.category_name or "Uncategorised",
            "colour":      r.colour or "#94a3b8",
            "total":       float(r.total),
            "pct":         round(float(r.total) / total_all * 100, 1),
        }
        for r in rows
    ]
