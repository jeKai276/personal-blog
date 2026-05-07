package bootstrap

import (
	"net/http"

	internal "github.com/yendp/personal-blog/internal/bootstrap"
)

// Setup initializes all shared state. Safe to call multiple times — runs once per process.
func Setup() { internal.Setup() }

// ServeHTTP routes the request through the configured Gin router.
func ServeHTTP(w http.ResponseWriter, r *http.Request) {
	internal.Router.ServeHTTP(w, r)
}
