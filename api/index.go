package handler

import (
	"net/http"

	"github.com/yendp/personal-blog/internal/bootstrap"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	bootstrap.Setup()
	bootstrap.Router.ServeHTTP(w, r)
}
