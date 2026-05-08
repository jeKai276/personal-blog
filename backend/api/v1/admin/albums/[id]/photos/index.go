package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yendp/personal-blog/internal/bootstrap"
	"github.com/yendp/personal-blog/internal/middleware"
	"github.com/yendp/personal-blog/internal/photo"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	bootstrap.Setup()

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.CORS(bootstrap.Cfg.AllowedOrigins))
	router.Use(middleware.NoEncoding())

	h := photo.NewHandler(bootstrap.PhotoSvc, bootstrap.Store)
	router.POST("/api/v1/admin/albums/:id/photos", middleware.RequireAuth(bootstrap.AuthSvc), h.AddPhoto)

	router.ServeHTTP(w, r)
}
