package auth

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// --- fake repository ---

type fakeRepo struct {
	admin  *Admin
	exists bool
	err    error
}

func (f *fakeRepo) FindByUsername(_ context.Context, username string) (*Admin, error) {
	if f.err != nil {
		return nil, f.err
	}
	if f.admin != nil && f.admin.Username == username {
		return f.admin, nil
	}
	return nil, nil
}

func (f *fakeRepo) Create(_ context.Context, username, passwordHash string) error {
	if f.err != nil {
		return f.err
	}
	// Simulate ON CONFLICT DO NOTHING: skip silently if an admin already exists.
	if f.exists {
		return nil
	}
	f.admin = &Admin{ID: 1, Username: username, PasswordHash: passwordHash}
	f.exists = true
	return nil
}

func (f *fakeRepo) Exists(_ context.Context) (bool, error) {
	return f.exists, f.err
}

// --- helpers ---

const testSecret = "test-secret"

func newServiceWithAdmin(t *testing.T, username, password string) (Service, *Admin) {
	t.Helper()
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.MinCost)
	if err != nil {
		t.Fatalf("generate hash: %v", err)
	}
	admin := &Admin{ID: 1, Username: username, PasswordHash: string(hash), CreatedAt: time.Now()}
	repo := &fakeRepo{admin: admin, exists: true}
	svc := NewService(repo, testSecret)
	return svc, admin
}

// --- tests ---

func TestLogin_Success(t *testing.T) {
	svc, _ := newServiceWithAdmin(t, "admin", "secret")

	token, err := svc.Login(context.Background(), "admin", "secret")
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if token == "" {
		t.Fatal("expected non-empty token")
	}
}

func TestLogin_WrongPassword(t *testing.T) {
	svc, _ := newServiceWithAdmin(t, "admin", "secret")

	_, err := svc.Login(context.Background(), "admin", "wrong")
	if !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("expected ErrInvalidCredentials, got: %v", err)
	}
}

func TestLogin_UnknownUser(t *testing.T) {
	svc, _ := newServiceWithAdmin(t, "admin", "secret")

	_, err := svc.Login(context.Background(), "nobody", "secret")
	if !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("expected ErrInvalidCredentials, got: %v", err)
	}
}

func TestLogin_RepositoryError(t *testing.T) {
	repo := &fakeRepo{err: errors.New("db down")}
	svc := NewService(repo, testSecret)

	_, err := svc.Login(context.Background(), "admin", "secret")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestValidateToken_Valid(t *testing.T) {
	svc, admin := newServiceWithAdmin(t, "admin", "secret")

	token, err := svc.Login(context.Background(), "admin", "secret")
	if err != nil {
		t.Fatalf("login: %v", err)
	}

	claims, err := svc.ValidateToken(token)
	if err != nil {
		t.Fatalf("validate: %v", err)
	}
	if claims.AdminID != admin.ID {
		t.Errorf("admin id mismatch: want %d got %d", admin.ID, claims.AdminID)
	}
	if claims.Username != admin.Username {
		t.Errorf("username mismatch: want %s got %s", admin.Username, claims.Username)
	}
}

func TestValidateToken_Invalid(t *testing.T) {
	svc, _ := newServiceWithAdmin(t, "admin", "secret")

	_, err := svc.ValidateToken("not.a.valid.token")
	if err == nil {
		t.Fatal("expected error for invalid token")
	}
}

func TestValidateToken_WrongSecret(t *testing.T) {
	svc, _ := newServiceWithAdmin(t, "admin", "secret")

	// Build a token signed with a different secret.
	claims := Claims{
		AdminID:  1,
		Username: "admin",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, _ := token.SignedString([]byte("other-secret"))

	_, err := svc.ValidateToken(signed)
	if err == nil {
		t.Fatal("expected error for token signed with wrong secret")
	}
}

func TestSeedAdmin_CreatesWhenNotExists(t *testing.T) {
	repo := &fakeRepo{exists: false}
	svc := NewService(repo, testSecret)

	if err := svc.SeedAdmin(context.Background(), "admin", "pass"); err != nil {
		t.Fatalf("seed admin: %v", err)
	}
	if repo.admin == nil {
		t.Fatal("expected admin to be created")
	}
	if repo.admin.Username != "admin" {
		t.Errorf("unexpected username: %s", repo.admin.Username)
	}
	// Verify hash is valid bcrypt.
	if err := bcrypt.CompareHashAndPassword([]byte(repo.admin.PasswordHash), []byte("pass")); err != nil {
		t.Errorf("password hash invalid: %v", err)
	}
}

func TestSeedAdmin_SkipsWhenExists(t *testing.T) {
	hash, _ := bcrypt.GenerateFromPassword([]byte("original"), bcrypt.MinCost)
	original := &Admin{ID: 1, Username: "admin", PasswordHash: string(hash)}
	repo := &fakeRepo{admin: original, exists: true}
	svc := NewService(repo, testSecret)

	if err := svc.SeedAdmin(context.Background(), "admin", "newpass"); err != nil {
		t.Fatalf("seed admin: %v", err)
	}
	// Hash must not have changed.
	if repo.admin.PasswordHash != string(hash) {
		t.Error("expected password hash to remain unchanged")
	}
}
