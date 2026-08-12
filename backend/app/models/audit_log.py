from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from sqlalchemy.orm import relationship

from ..core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=True)
    entity_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
