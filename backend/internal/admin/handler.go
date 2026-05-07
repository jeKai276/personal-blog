package admin

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yendp/personal-blog/pkg/response"
)

// Handler holds HTTP handler methods for the admin domain.
type Handler struct {
	svc Service
}

// NewHandler creates a new admin Handler.
func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// GetStats handles GET /admin/stats — aggregate counts for the dashboard.
func (h *Handler) GetStats(c *gin.Context) {
	stats, err := h.svc.GetStats(c.Request.Context())
	if err != nil {
		log.Printf("admin.GetStats: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to fetch stats")
		return
	}
	response.OK(c, stats)
}
