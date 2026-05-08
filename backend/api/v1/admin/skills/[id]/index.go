package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yendp/personal-blog/internal/bootstrap"
	"github.com/yendp/personal-blog/internal/middleware"
	"github.com/yendp/personal-blog/internal/skill"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	bootstrap.Setup()

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.CORS(bootstrap.Cfg.AllowedOrigins))
	router.Use(middleware.NoEncoding())

	h := skill.NewHandler(bootstrap.SkillSvc)
	router.PUT("/api/v1/admin/skills/:id", middleware.RequireAuth(bootstrap.AuthSvc), h.Update)
	router.DELETE("/api/v1/admin/skills/:id", middleware.RequireAuth(bootstrap.AuthSvc), h.Delete)

	router.ServeHTTP(w, r)
}
