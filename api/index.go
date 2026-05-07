package handler

import (
	"net/http"

	"github.com/yendp/personal-blog/bootstrap"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	bootstrap.Setup()
	bootstrap.ServeHTTP(w, r)
}
