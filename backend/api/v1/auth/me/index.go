package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	iauth "github.com/yendp/personal-blog/internal/auth"
	"github.com/yendp/personal-blog/internal/bootstrap"
	"github.com/yendp/personal-blog/internal/middleware"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	bootstrap.Setup()

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.CORS(bootstrap.Cfg.AllowedOrigins))

	h := iauth.NewHandler(bootstrap.AuthSvc, bootstrap.Cfg.CookieSecure)
	router.GET("/api/v1/auth/me", middleware.RequireAuth(bootstrap.AuthSvc), h.Me)

	router.ServeHTTP(w, r)
}
