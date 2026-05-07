package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Admin represents an admin user stored in the database.
type Admin struct {
	ID           int
	Username     string
	PasswordHash string
	CreatedAt    time.Time
}

// LoginRequest is the JSON body for the login endpoint.
type LoginRequest struct {
	Username string `json:"username" binding:"required,max=50"`
	// max=72 matches bcrypt's hard limit — bytes beyond 72 are silently truncated.
	Password string `json:"password" binding:"required,min=8,max=72"`
}

// Claims is the JWT payload stored inside the token.
type Claims struct {
	AdminID  int    `json:"admin_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}
