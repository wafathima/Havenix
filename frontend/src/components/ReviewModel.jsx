import { useState } from "react";
import { FaStar, FaTimes, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";
import API from "../api/axios";

function ReviewModal({ isOpen, onClose, propertyId, propertyTitle, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    if (!comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    setSubmitting(true);
    try {
      const response = await API.post("/reviews", {
        propertyId,
        rating,
        comment: comment.trim()
      });

      if (response.data.success) {
        toast.success("Review submitted successfully!");
        onReviewSubmitted(response.data.review);
        onClose();
        // Reset form
        setRating(0);
        setComment("");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      background: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }}>
      <div style={{
        background: "white",
        borderRadius: "2px",
        maxWidth: "500px",
        width: "100%",
        maxHeight: "90vh",
        overflow: "auto",
        animation: "modalIn 0.3s ease"
      }}>
        {/* Header */}
        <div style={{
          background: "#1E1C18",
          padding: "24px 28px",
          position: "relative"
        }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              width: "32px",
              height: "32px",
              borderRadius: "2px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#C4A97A"
            }}
          >
            <FaTimes size={14} />
          </button>
          <div className="pd-sans" style={{
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#8B7355",
            marginBottom: "8px"
          }}>
            Write a Review
          </div>
          <h3 className="pd-serif" style={{
            fontSize: "1.5rem",
            fontWeight: 400,
            color: "#F5F0E8",
            lineHeight: 1.2,
            marginBottom: "4px"
          }}>
            Share Your Experience
          </h3>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.85rem",
            color: "#8B7355"
          }}>
            {propertyTitle}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "28px" }}>
          {/* Rating Stars */}
          <div style={{ marginBottom: "24px" }}>
            <label className="pd-sans" style={{
              display: "block",
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#8B7355",
              marginBottom: "10px"
            }}>
              Your Rating *
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    fontSize: "1.5rem",
                    color: (hoverRating || rating) >= star ? "#C4A97A" : "#D4C9B5",
                    transition: "color 0.2s ease"
                  }}
                >
                  <FaStar />
                </button>
              ))}
              <span className="pd-sans" style={{
                fontSize: "0.8rem",
                color: "#8B7355",
                marginLeft: "8px"
              }}>
                {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : "Select rating"}
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div style={{ marginBottom: "24px" }}>
            <label className="pd-sans" style={{
              display: "block",
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#8B7355",
              marginBottom: "8px"
            }}>
              Your Review *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this property. What did you like? Any suggestions?"
              rows={5}
              required
              style={{
                width: "100%",
                background: "#F5F0E8",
                border: "1px solid rgba(139,115,85,0.2)",
                borderRadius: "2px",
                padding: "14px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.875rem",
                color: "#2C2A26",
                outline: "none",
                resize: "vertical",
                lineHeight: 1.6,
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#8B7355";
                e.target.style.boxShadow = "0 0 0 3px rgba(139,115,85,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(139,115,85,0.2)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                background: "#8B7355",
                color: "white",
                border: "none",
                padding: "14px",
                borderRadius: "2px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.75rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              {submitting ? (
                <>
                  <FaSpinner style={{ animation: "spin 0.8s linear infinite" }} size={14} />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: "transparent",
                color: "#8B7355",
                border: "1px solid rgba(139,115,85,0.3)",
                padding: "14px",
                borderRadius: "2px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.75rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewModal;