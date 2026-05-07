package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yendp/personal-blog/internal/blog"
	"github.com/yendp/personal-blog/internal/bootstrap"
	"github.com/yendp/personal-blog/internal/middleware"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	bootstrap.Setup()

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.CORS(bootstrap.Cfg.AllowedOrigins))

	h := blog.NewHandler(bootstrap.BlogSvc)
	router.PATCH("/api/v1/admin/posts/:id/publish", middleware.RequireAuth(bootstrap.AuthSvc), h.TogglePublish)

	router.ServeHTTP(w, r)
}
