package config

import (
	"os"
	"strings"
)

// Config holds all application configuration loaded from environment variables.
type Config struct {
	DBHost             string
	DBPort             string
	DBUser             string
	DBPassword         string
	DBName             string
	DBSSLMode          string
	JWTSecret          string
	AdminUsername      string
	AdminPassword      string
	ServerPort         string
	CookieSecure       bool
	AllowedOrigins     []string
	AWSS3Bucket        string
	AWSS3Region        string
	AWSAccessKeyID     string
	AWSSecretAccessKey string
	AWSS3BaseURL       string
}

// Load reads configuration from environment variables.
// All values must be set via environment; no defaults are provided for credentials.
func Load() *Config {
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}

	sslMode := os.Getenv("DB_SSLMODE")
	if sslMode == "" {
		sslMode = "disable"
	}

	allowedOrigins := []string{"http://localhost:3000"}
	if raw := os.Getenv("ALLOWED_ORIGINS"); raw != "" {
		allowedOrigins = strings.Split(raw, ",")
		for i := range allowedOrigins {
			allowedOrigins[i] = strings.TrimSpace(allowedOrigins[i])
		}
	}

	return &Config{
		DBHost:         os.Getenv("DB_HOST"),
		DBPort:         dbPort,
		DBUser:         os.Getenv("DB_USER"),
		DBPassword:     os.Getenv("DB_PASSWORD"),
		DBName:         os.Getenv("DB_NAME"),
		DBSSLMode:      sslMode,
		JWTSecret:      os.Getenv("JWT_SECRET"),
		AdminUsername:  os.Getenv("ADMIN_USERNAME"),
		AdminPassword:  os.Getenv("ADMIN_PASSWORD"),
		ServerPort:     port,
		CookieSecure:       os.Getenv("COOKIE_SECURE") == "true",
		AllowedOrigins:     allowedOrigins,
		AWSS3Bucket:        os.Getenv("AWS_S3_BUCKET"),
		AWSS3Region:        os.Getenv("AWS_S3_REGION"),
		AWSAccessKeyID:     os.Getenv("AWS_ACCESS_KEY_ID"),
		AWSSecretAccessKey: os.Getenv("AWS_SECRET_ACCESS_KEY"),
		AWSS3BaseURL:       os.Getenv("AWS_S3_BASE_URL"),
	}
}
