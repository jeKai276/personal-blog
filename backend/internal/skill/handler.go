package skill

import (
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yendp/personal-blog/pkg/response"
)

// Handler holds HTTP handler methods for the skill domain.
type Handler struct {
	svc Service
}

// NewHandler creates a new skill Handler.
func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// List handles GET /skills — public.
func (h *Handler) List(c *gin.Context) {
	skills, err := h.svc.List(c.Request.Context())
	if err != nil {
		log.Printf("skill.List: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to fetch skills")
		return
	}
	response.OK(c, skills)
}

// Create handles POST /admin/skills.
func (h *Handler) Create(c *gin.Context) {
	var req CreateSkillRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	sk, err := h.svc.Create(c.Request.Context(), req)
	if err != nil {
		log.Printf("skill.Create: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to create skill")
		return
	}
	response.Created(c, sk)
}

// Update handles PUT /admin/skills/:id.
func (h *Handler) Update(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	var req UpdateSkillRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	sk, err := h.svc.Update(c.Request.Context(), id, req)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			response.Error(c, http.StatusNotFound, "skill not found")
			return
		}
		log.Printf("skill.Update: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to update skill")
		return
	}
	response.OK(c, sk)
}

// Delete handles DELETE /admin/skills/:id.
func (h *Handler) Delete(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	if err := h.svc.Delete(c.Request.Context(), id); err != nil {
		if errors.Is(err, ErrNotFound) {
			response.Error(c, http.StatusNotFound, "skill not found")
			return
		}
		log.Printf("skill.Delete: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to delete skill")
		return
	}
	response.Message(c, "skill deleted")
}

func parseID(c *gin.Context) (int, bool) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		response.Error(c, http.StatusBadRequest, "invalid id")
		return 0, false
	}
	return id, true
}
