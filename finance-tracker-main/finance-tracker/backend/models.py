# backend/models.py
from sqlalchemy import (
    Column, Integer, String, Numeric, Date,
    DateTime, ForeignKey, Text, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Account(Base):
    __tablename__ = "accounts"
    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=False)
    type       = Column(String(20),  nullable=False)
    balance    = Column(Numeric(12, 2), nullable=False, default=0)
    currency   = Column(String(3),  nullable=False, default="USD")
    color      = Column(String(7),  nullable=False, default="#6366f1")
    created_at = Column(DateTime,   server_default=func.now())
    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"
    id     = Column(Integer, primary_key=True, index=True)
    name   = Column(String(50), nullable=False)
    type   = Column(String(10), nullable=False)
    colour = Column(String(7),  nullable=False, default="#94a3b8")
    icon   = Column(String(30), nullable=True)
    transactions = relationship("Transaction", back_populates="category")
    budgets      = relationship("Budget", back_populates="category", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"
    id          = Column(Integer, primary_key=True, index=True)
    account_id  = Column(Integer, ForeignKey("accounts.id",  ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    amount      = Column(Numeric(12, 2), nullable=False)
    type        = Column(String(10), nullable=False)
    description = Column(Text, nullable=True)
    date        = Column(Date, nullable=False, index=True)
    notes       = Column(Text, nullable=True)
    created_at  = Column(DateTime, server_default=func.now())
    account  = relationship("Account",  back_populates="transactions")
    category = relationship("Category", back_populates="transactions")


class Budget(Base):
    __tablename__ = "budgets"
    id          = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    amount      = Column(Numeric(12, 2), nullable=False)
    month       = Column(Date, nullable=False)
    __table_args__ = (
        UniqueConstraint("category_id", "month", name="uq_budget_category_month"),
    )
    category = relationship("Category", back_populates="budgets")
