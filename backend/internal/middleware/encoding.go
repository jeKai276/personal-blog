package middleware

import "github.com/gin-gonic/gin"

// NoEncoding removes Content-Encoding header to prevent double-gzip on Vercel.
// Vercel proxy adds gzip automatically; backend shouldn't set it.
func NoEncoding() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Content-Encoding", "")
		c.Next()
	}
}
