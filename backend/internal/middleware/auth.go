package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yendp/personal-blog/internal/auth"
	"github.com/yendp/personal-blog/pkg/response"
)

// RequireAuth is a Gin middleware that validates the JWT from the auth_token cookie.
// It sets "admin_id" and "username" in the Gin context for downstream handlers.
func RequireAuth(svc auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie(auth.CookieName)
		if err != nil || token == "" {
			response.Error(c, http.StatusUnauthorized, "authentication required")
			c.Abort()
			return
		}

		claims, err := svc.ValidateToken(token)
		if err != nil {
			response.Error(c, http.StatusUnauthorized, "invalid or expired session")
			c.Abort()
			return
		}

		c.Set("admin_id", claims.AdminID)
		c.Set("username", claims.Username)
		c.Next()
	}
}
