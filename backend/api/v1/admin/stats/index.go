package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yendp/personal-blog/internal/admin"
	"github.com/yendp/personal-blog/internal/bootstrap"
	"github.com/yendp/personal-blog/internal/middleware"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	bootstrap.Setup()

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.CORS(bootstrap.Cfg.AllowedOrigins))
	router.Use(middleware.NoEncoding())

	h := admin.NewHandler(bootstrap.AdminSvc)
	router.GET("/api/v1/admin/stats", middleware.RequireAuth(bootstrap.AuthSvc), h.GetStats)

	router.ServeHTTP(w, r)
}
