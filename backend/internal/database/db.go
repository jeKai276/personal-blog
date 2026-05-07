package database

import (
	"database/sql"
	"fmt"

	"github.com/yendp/personal-blog/config"
	_ "github.com/lib/pq"
)

// Connect opens a PostgreSQL connection and verifies it with a ping.
// It prefers DATABASE_URL when set (e.g. Vercel Postgres), falling back to
// individual DB_* fields for local development.
func Connect(cfg *config.Config) (*sql.DB, error) {
	dsn := cfg.DatabaseURL
	if dsn == "" {
		dsn = fmt.Sprintf(
			"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
			cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBSSLMode,
		)
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}

	return db, nil
}
