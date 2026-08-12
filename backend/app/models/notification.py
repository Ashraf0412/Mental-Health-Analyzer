from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from datetime import datetime
from sqlalchemy.orm import relationship

from ..core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    notification_type = Column(String, default="general")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", backref="notifications")
