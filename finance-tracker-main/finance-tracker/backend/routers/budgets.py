# backend/routers/budgets.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
import calendar
from database import get_db
import models, schemas

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("/", response_model=list[schemas.BudgetOut])
def list_budgets(month: date | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Budget)
    if month:
        q = q.filter(models.Budget.month == month.replace(day=1))
    return q.order_by(models.Budget.month.desc()).all()


@router.post("/", response_model=schemas.BudgetOut, status_code=201)
def create_budget(body: schemas.BudgetCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Budget).filter(
        models.Budget.category_id == body.category_id,
        models.Budget.month       == body.month,
    ).first()
    if existing:
        existing.amount = body.amount
        db.commit()
        db.refresh(existing)
        return existing
    budget = models.Budget(**body.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@router.delete("/{budget_id}", status_code=204)
def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    budget = db.query(models.Budget).filter(models.Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(budget)
    db.commit()


@router.get("/progress", response_model=list[schemas.BudgetProgress])
def budget_progress(
    month: date = Query(...),
    db:    Session = Depends(get_db),
):
    month_start = month.replace(day=1)
    last_day    = calendar.monthrange(month.year, month.month)[1]
    month_end   = month.replace(day=last_day)

    spent_sq = (
        db.query(
            models.Transaction.category_id,
            func.sum(models.Transaction.amount).label("spent"),
        )
        .filter(
            models.Transaction.type == "expense",
            models.Transaction.date >= month_start,
            models.Transaction.date <= month_end,
        )
        .group_by(models.Transaction.category_id)
        .subquery()
    )

    rows = (
        db.query(models.Budget, spent_sq.c.spent)
        .outerjoin(spent_sq, models.Budget.category_id == spent_sq.c.category_id)
        .filter(models.Budget.month == month_start)
        .all()
    )

    return [
        {
            "budget_id": b.id,
            "category":  b.category.name,
            "colour":    b.category.colour,
            "budgeted":  float(b.amount),
            "spent":     float(spent or 0),
            "remaining": float(b.amount - (spent or 0)),
            "pct":       round(float((spent or 0) / b.amount * 100), 1) if b.amount > 0 else 0,
        }
        for b, spent in rows
    ]
