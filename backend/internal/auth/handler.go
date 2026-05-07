package auth

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yendp/personal-blog/pkg/response"
)

const CookieName = "auth_token"
const cookieMaxAge = 7 * 24 * 60 * 60 // 7 days in seconds

// Handler holds the HTTP handlers for the auth domain.
type Handler struct {
	svc          Service
	cookieSecure bool
}

// NewHandler returns a new auth Handler.
// cookieSecure should be true in production (HTTPS only).
func NewHandler(svc Service, cookieSecure bool) *Handler {
	return &Handler{svc: svc, cookieSecure: cookieSecure}
}

// Login handles POST /api/v1/auth/login.
// On success it sets an httpOnly, SameSite=Strict cookie containing the JWT.
func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "username and password are required")
		return
	}

	token, err := h.svc.Login(c.Request.Context(), req.Username, req.Password)
	if err != nil {
		if errors.Is(err, ErrInvalidCredentials) {
			response.Error(c, http.StatusUnauthorized, "invalid credentials")
			return
		}
		response.Error(c, http.StatusInternalServerError, "login failed")
		return
	}

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     CookieName,
		Value:    token,
		MaxAge:   cookieMaxAge,
		Path:     "/",
		HttpOnly: true,
		Secure:   h.cookieSecure,
		SameSite: http.SameSiteStrictMode,
	})
	response.Message(c, "logged in successfully")
}

// Logout handles POST /api/v1/auth/logout.
// Clears the auth cookie by setting MaxAge to -1.
func (h *Handler) Logout(c *gin.Context) {
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     CookieName,
		Value:    "",
		MaxAge:   -1,
		Path:     "/",
		HttpOnly: true,
		Secure:   h.cookieSecure,
		SameSite: http.SameSiteStrictMode,
	})
	response.Message(c, "logged out successfully")
}

// Me handles GET /api/v1/auth/me.
// Returns the authenticated admin's username. Requires RequireAuth middleware.
func (h *Handler) Me(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "not authenticated")
		return
	}

	response.OK(c, gin.H{"username": username})
}
