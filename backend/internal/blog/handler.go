package blog

import (
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yendp/personal-blog/pkg/response"
)

// Handler holds HTTP handler methods for the blog domain.
type Handler struct {
	svc Service
}

// NewHandler creates a new blog Handler.
func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// List handles GET /posts — public list of published posts.
func (h *Handler) List(c *gin.Context) {
	tag := c.Query("tag")
	page := queryInt(c, "page", 1)
	limit := queryInt(c, "limit", 10)

	posts, total, err := h.svc.ListPublished(c.Request.Context(), tag, page, limit)
	if err != nil {
		log.Printf("blog.List: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to fetch posts")
		return
	}

	response.OK(c, gin.H{
		"posts": posts,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// GetBySlug handles GET /posts/:slug — public single post.
func (h *Handler) GetBySlug(c *gin.Context) {
	sl := c.Param("slug")
	post, err := h.svc.GetBySlug(c.Request.Context(), sl)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			response.Error(c, http.StatusNotFound, "post not found")
			return
		}
		log.Printf("blog.GetBySlug: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to fetch post")
		return
	}
	response.OK(c, post)
}

// GetByID handles GET /admin/posts/:id — admin fetch single post by ID.
func (h *Handler) GetByID(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}
	post, err := h.svc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			response.Error(c, http.StatusNotFound, "post not found")
			return
		}
		log.Printf("blog.GetByID: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to fetch post")
		return
	}
	response.OK(c, post)
}

// ListAll handles GET /admin/posts — admin list of all posts (including drafts).
func (h *Handler) ListAll(c *gin.Context) {
	page := queryInt(c, "page", 1)
	limit := queryInt(c, "limit", 10)

	posts, total, err := h.svc.ListAll(c.Request.Context(), page, limit)
	if err != nil {
		log.Printf("blog.ListAll: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to fetch posts")
		return
	}

	response.OK(c, gin.H{
		"posts": posts,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// Create handles POST /admin/posts.
func (h *Handler) Create(c *gin.Context) {
	var req CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	post, err := h.svc.Create(c.Request.Context(), req)
	if err != nil {
		log.Printf("blog.Create: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to create post")
		return
	}
	response.Created(c, post)
}

// Update handles PUT /admin/posts/:id.
func (h *Handler) Update(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	var req UpdatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	post, err := h.svc.Update(c.Request.Context(), id, req)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			response.Error(c, http.StatusNotFound, "post not found")
			return
		}
		log.Printf("blog.Update: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to update post")
		return
	}
	response.OK(c, post)
}

// Delete handles DELETE /admin/posts/:id.
func (h *Handler) Delete(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	if err := h.svc.Delete(c.Request.Context(), id); err != nil {
		if errors.Is(err, ErrNotFound) {
			response.Error(c, http.StatusNotFound, "post not found")
			return
		}
		log.Printf("blog.Delete: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to delete post")
		return
	}
	response.Message(c, "post deleted")
}

// TogglePublish handles PATCH /admin/posts/:id/publish.
func (h *Handler) TogglePublish(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	var body struct {
		Publish bool `json:"publish"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	var (
		post *Post
		err  error
	)
	if body.Publish {
		post, err = h.svc.Publish(c.Request.Context(), id)
	} else {
		post, err = h.svc.Unpublish(c.Request.Context(), id)
	}

	if err != nil {
		if errors.Is(err, ErrNotFound) {
			response.Error(c, http.StatusNotFound, "post not found")
			return
		}
		log.Printf("blog.TogglePublish: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to update post status")
		return
	}
	response.OK(c, post)
}

// parseID extracts and validates the :id URL parameter.
func parseID(c *gin.Context) (int, bool) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		response.Error(c, http.StatusBadRequest, "invalid id")
		return 0, false
	}
	return id, true
}

// queryInt reads an integer query param, returning def if absent or invalid.
func queryInt(c *gin.Context, key string, def int) int {
	raw := c.Query(key)
	if raw == "" {
		return def
	}
	v, err := strconv.Atoi(raw)
	if err != nil || v <= 0 {
		return def
	}
	return v
}
