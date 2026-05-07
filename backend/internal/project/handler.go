package project

import (
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yendp/personal-blog/pkg/response"
)

// Handler holds HTTP handler methods for the project domain.
type Handler struct {
	svc Service
}

// NewHandler creates a new project Handler.
func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// List handles GET /projects — public.
func (h *Handler) List(c *gin.Context) {
	projects, err := h.svc.List(c.Request.Context())
	if err != nil {
		log.Printf("project.List: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to fetch projects")
		return
	}
	response.OK(c, projects)
}

// Create handles POST /admin/projects.
func (h *Handler) Create(c *gin.Context) {
	var req CreateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	p, err := h.svc.Create(c.Request.Context(), req)
	if err != nil {
		log.Printf("project.Create: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to create project")
		return
	}
	response.Created(c, p)
}

// Update handles PUT /admin/projects/:id.
func (h *Handler) Update(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	var req UpdateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	p, err := h.svc.Update(c.Request.Context(), id, req)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			response.Error(c, http.StatusNotFound, "project not found")
			return
		}
		log.Printf("project.Update: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to update project")
		return
	}
	response.OK(c, p)
}

// Delete handles DELETE /admin/projects/:id.
func (h *Handler) Delete(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	if err := h.svc.Delete(c.Request.Context(), id); err != nil {
		if errors.Is(err, ErrNotFound) {
			response.Error(c, http.StatusNotFound, "project not found")
			return
		}
		log.Printf("project.Delete: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to delete project")
		return
	}
	response.Message(c, "project deleted")
}

func parseID(c *gin.Context) (int, bool) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		response.Error(c, http.StatusBadRequest, "invalid id")
		return 0, false
	}
	return id, true
}
