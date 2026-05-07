package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/yendp/personal-blog/pkg/response"
)

func init() {
	gin.SetMode(gin.TestMode)
}

// fakeAuthService is a Service stub for handler tests.
type fakeAuthService struct {
	token  string
	claims *Claims
	err    error
}

func (f *fakeAuthService) Login(_ context.Context, _, _ string) (string, error) {
	return f.token, f.err
}

func (f *fakeAuthService) SeedAdmin(_ context.Context, _, _ string) error {
	return f.err
}

func (f *fakeAuthService) ValidateToken(_ string) (*Claims, error) {
	if f.err != nil {
		return nil, f.err
	}
	return f.claims, nil
}

func newTestRouter(svc Service) *gin.Engine {
	r := gin.New()
	h := NewHandler(svc, false)
	r.POST("/login", h.Login)
	r.POST("/logout", h.Logout)
	// /me with username pre-set in context (simulates passing RequireAuth middleware).
	r.GET("/me", func(c *gin.Context) {
		c.Set("username", "admin")
		h.Me(c)
	})
	// /me-unauth has no username in context.
	r.GET("/me-unauth", h.Me)
	return r
}

func TestLoginHandler_Success(t *testing.T) {
	r := newTestRouter(&fakeAuthService{token: "tok123"})

	req := httptest.NewRequest(http.MethodPost, "/login",
		strings.NewReader(`{"username":"admin","password":"password123"}`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	// Cookie must be set.
	found := false
	for _, c := range w.Result().Cookies() {
		if c.Name == CookieName {
			found = true
			if c.Value != "tok123" {
				t.Errorf("cookie value: want tok123, got %s", c.Value)
			}
		}
	}
	if !found {
		t.Errorf("expected %s cookie to be set", CookieName)
	}

	var resp response.Response
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !resp.Success {
		t.Error("expected success=true")
	}
}

func TestLoginHandler_MissingBody(t *testing.T) {
	r := newTestRouter(&fakeAuthService{})

	req := httptest.NewRequest(http.MethodPost, "/login", nil)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
}

func TestLoginHandler_ShortPassword(t *testing.T) {
	r := newTestRouter(&fakeAuthService{token: "tok"})

	req := httptest.NewRequest(http.MethodPost, "/login",
		strings.NewReader(`{"username":"admin","password":"short"}`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for short password (min=8), got %d", w.Code)
	}
}

func TestLoginHandler_InvalidCredentials(t *testing.T) {
	r := newTestRouter(&fakeAuthService{err: ErrInvalidCredentials})

	req := httptest.NewRequest(http.MethodPost, "/login",
		strings.NewReader(`{"username":"admin","password":"wrongpass"}`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}

	var resp response.Response
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp.Success {
		t.Error("expected success=false")
	}
}

func TestLogoutHandler_ClearsCookie(t *testing.T) {
	r := newTestRouter(&fakeAuthService{})

	req := httptest.NewRequest(http.MethodPost, "/logout", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	// MaxAge is round-tripped: -1 → Max-Age=0 in header → parsed back as -1.
	for _, c := range w.Result().Cookies() {
		if c.Name == CookieName {
			if c.MaxAge >= 0 {
				t.Errorf("expected negative MaxAge to signal deletion, got %d", c.MaxAge)
			}
			return
		}
	}
	t.Errorf("expected %s cookie in Set-Cookie response header", CookieName)
}

func TestMeHandler_Success(t *testing.T) {
	r := newTestRouter(&fakeAuthService{})

	req := httptest.NewRequest(http.MethodGet, "/me", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	var resp response.Response
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !resp.Success {
		t.Error("expected success=true")
	}
	if resp.Data == nil {
		t.Error("expected data to contain username")
	}
}

func TestMeHandler_Unauthenticated(t *testing.T) {
	r := newTestRouter(&fakeAuthService{})

	req := httptest.NewRequest(http.MethodGet, "/me-unauth", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}
}
