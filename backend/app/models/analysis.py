from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from ..core.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    input_type = Column(String, nullable=False)
    original_text = Column(Text, nullable=True)
    transcription = Column(Text, nullable=True)
    risk_score = Column(Integer, nullable=True)
    risk_level = Column(String, nullable=True)
    concerns = Column(Text, nullable=True)
    advice = Column(Text, nullable=True)
    ai_model = Column(String, nullable=True)
    processing_time = Column(Float, nullable=True)
    requires_review = Column(Boolean, default=False)
    clinical_status = Column(String, default="pending_review")
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", backref="analyses")
