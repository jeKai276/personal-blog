package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yendp/personal-blog/internal/bootstrap"
	"github.com/yendp/personal-blog/internal/middleware"
	"github.com/yendp/personal-blog/internal/project"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	bootstrap.Setup()

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.CORS(bootstrap.Cfg.AllowedOrigins))

	h := project.NewHandler(bootstrap.ProjectSvc)
	router.POST("/api/v1/admin/projects", middleware.RequireAuth(bootstrap.AuthSvc), h.Create)

	router.ServeHTTP(w, r)
}
