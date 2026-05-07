package photo

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yendp/personal-blog/pkg/response"
	"github.com/yendp/personal-blog/pkg/storage"
)

// Handler holds HTTP handler methods for the photo domain.
type Handler struct {
	svc   Service
	store storage.Storage
}

// NewHandler creates a new photo Handler.
func NewHandler(svc Service, store storage.Storage) *Handler {
	return &Handler{svc: svc, store: store}
}

// ---- Album handlers ----

// ListAlbums handles GET /albums — public.
func (h *Handler) ListAlbums(c *gin.Context) {
	albums, err := h.svc.ListAlbums(c.Request.Context())
	if err != nil {
		log.Printf("photo.ListAlbums: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to fetch albums")
		return
	}
	response.OK(c, albums)
}

// GetAlbum handles GET /albums/:id — public, includes photos.
func (h *Handler) GetAlbum(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	album, err := h.svc.GetAlbum(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			response.Error(c, http.StatusNotFound, "album not found")
			return
		}
		log.Printf("photo.GetAlbum: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to fetch album")
		return
	}
	response.OK(c, album)
}

// CreateAlbum handles POST /admin/albums.
func (h *Handler) CreateAlbum(c *gin.Context) {
	var req CreateAlbumRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	album, err := h.svc.CreateAlbum(c.Request.Context(), req)
	if err != nil {
		log.Printf("photo.CreateAlbum: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to create album")
		return
	}
	response.Created(c, album)
}

// UpdateAlbum handles PUT /admin/albums/:id.
func (h *Handler) UpdateAlbum(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	var req UpdateAlbumRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	album, err := h.svc.UpdateAlbum(c.Request.Context(), id, req)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			response.Error(c, http.StatusNotFound, "album not found")
			return
		}
		log.Printf("photo.UpdateAlbum: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to update album")
		return
	}
	response.OK(c, album)
}

// DeleteAlbum handles DELETE /admin/albums/:id.
func (h *Handler) DeleteAlbum(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	if err := h.svc.DeleteAlbum(c.Request.Context(), id); err != nil {
		if errors.Is(err, ErrNotFound) {
			response.Error(c, http.StatusNotFound, "album not found")
			return
		}
		log.Printf("photo.DeleteAlbum: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to delete album")
		return
	}
	response.Message(c, "album deleted")
}

// ---- Photo handlers ----

// AddPhoto handles POST /admin/albums/:id/photos.
func (h *Handler) AddPhoto(c *gin.Context) {
	albumID, ok := parseID(c)
	if !ok {
		return
	}

	var req AddPhotoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	photo, err := h.svc.AddPhoto(c.Request.Context(), albumID, req)
	if err != nil {
		log.Printf("photo.AddPhoto: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to add photo")
		return
	}
	response.Created(c, photo)
}

// DeletePhoto handles DELETE /admin/photos/:id.
func (h *Handler) DeletePhoto(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	if err := h.svc.DeletePhoto(c.Request.Context(), id); err != nil {
		if errors.Is(err, ErrNotFound) {
			response.Error(c, http.StatusNotFound, "photo not found")
			return
		}
		log.Printf("photo.DeletePhoto: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to delete photo")
		return
	}
	response.Message(c, "photo deleted")
}

// UpdatePhoto handles PATCH /admin/photos/:id.
func (h *Handler) UpdatePhoto(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	var req UpdatePhotoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	photo, err := h.svc.UpdatePhoto(c.Request.Context(), id, req)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			response.Error(c, http.StatusNotFound, "photo not found")
			return
		}
		log.Printf("photo.UpdatePhoto: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to update photo")
		return
	}
	response.OK(c, photo)
}

// PresignedURL handles POST /admin/upload/presigned-url.
func (h *Handler) PresignedURL(c *gin.Context) {
	var req PresignedURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	// Sanitize filename: replace spaces, keep extension.
	sanitized := sanitizeFilename(req.Filename)

	// Build a unique key using timestamp + nanoseconds.
	key := fmt.Sprintf("photos/%d/%s", time.Now().UnixNano(), sanitized)

	url, err := h.store.PresignedPutURL(c.Request.Context(), key, req.ContentType, 15*time.Minute)
	if err != nil {
		log.Printf("photo.PresignedURL: %v", err)
		response.Error(c, http.StatusInternalServerError, "failed to generate upload URL")
		return
	}

	response.OK(c, gin.H{
		"upload_url": url,
		"key":        key,
	})
}

// ---- helpers ----

func parseID(c *gin.Context) (int, bool) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		response.Error(c, http.StatusBadRequest, "invalid id")
		return 0, false
	}
	return id, true
}

func sanitizeFilename(name string) string {
	name = strings.ReplaceAll(name, "..", "")
	name = strings.ReplaceAll(name, "/", "")
	name = strings.ReplaceAll(name, "\\", "")
	name = strings.ReplaceAll(name, " ", "_")
	name = strings.ReplaceAll(name, "#", "")
	name = strings.ReplaceAll(name, "?", "")
	name = strings.ReplaceAll(name, "%", "")
	return name
}
