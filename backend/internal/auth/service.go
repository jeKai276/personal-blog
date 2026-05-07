package auth

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const tokenTTL = 7 * 24 * time.Hour

// ErrInvalidCredentials is returned when username or password do not match.
var ErrInvalidCredentials = errors.New("invalid credentials")

// Service handles authentication business logic.
type Service interface {
	Login(ctx context.Context, username, password string) (string, error)
	SeedAdmin(ctx context.Context, username, password string) error
	ValidateToken(tokenString string) (*Claims, error)
}

type service struct {
	repo      Repository
	jwtSecret []byte
}

// NewService returns a Service with the given repository and JWT secret.
func NewService(repo Repository, jwtSecret string) Service {
	return &service{
		repo:      repo,
		jwtSecret: []byte(jwtSecret),
	}
}

// Login verifies credentials and returns a signed JWT string on success.
func (s *service) Login(ctx context.Context, username, password string) (string, error) {
	admin, err := s.repo.FindByUsername(ctx, username)
	if err != nil {
		return "", fmt.Errorf("find admin: %w", err)
	}
	if admin == nil {
		return "", ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(password)); err != nil {
		return "", ErrInvalidCredentials
	}

	token, err := s.generateToken(admin)
	if err != nil {
		return "", fmt.Errorf("generate token: %w", err)
	}
	return token, nil
}

// SeedAdmin creates the admin account if it does not already exist.
// The underlying INSERT uses ON CONFLICT DO NOTHING, so concurrent calls are safe.
func (s *service) SeedAdmin(ctx context.Context, username, password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}
	if err := s.repo.Create(ctx, username, string(hash)); err != nil {
		return fmt.Errorf("create admin: %w", err)
	}
	return nil
}

// ValidateToken parses and validates a JWT string, returning its claims.
func (s *service) ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return s.jwtSecret, nil
	})
	if err != nil || !token.Valid {
		return nil, errors.New("invalid or expired token")
	}
	return claims, nil
}

func (s *service) generateToken(admin *Admin) (string, error) {
	now := time.Now()
	claims := Claims{
		AdminID:  admin.ID,
		Username: admin.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "personal-blog",
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(tokenTTL)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}
