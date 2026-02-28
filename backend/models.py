
from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    
class Resource(Base):
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)
    cost_per_hour = Column(Float)
    max_capacity = Column(Integer)
    current_load = Column(Float, default=0.0)
    status = Column(String)
    
    metrics = relationship("Metric", back_populates="resource")
    
class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    priority = Column(Integer) # 1: Low, 2: Medium, 3: High, 4: Urgent
    estimated_time = Column(Float)
    assigned_resource_id = Column(Integer, ForeignKey("resources.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String) # PENDING, ASSIGNED, IN_PROGRESS, COMPLETED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    assigned_resource = relationship("Resource")

class Metric(Base):
    __tablename__ = "metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"))
    cpu_load = Column(Float)
    memory_load = Column(Float)
    latency = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    resource = relationship("Resource", back_populates="metrics")
