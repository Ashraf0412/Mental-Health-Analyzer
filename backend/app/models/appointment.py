from sqlalchemy import Column, Integer, Date, Time, String, DateTime, ForeignKey
from datetime import datetime
from sqlalchemy.orm import relationship

from ..core.database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    requested_date = Column(Date, nullable=True)
    requested_time = Column(Time, nullable=True)
    appointment_date = Column(Date, nullable=True)
    appointment_time = Column(Time, nullable=True)
    reason = Column(String, nullable=True)
    status = Column(String, default="pending")
    admin_notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", backref="appointments")
