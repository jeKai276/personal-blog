package auth

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
)

// Repository defines the data-access operations for the admin table.
type Repository interface {
	FindByUsername(ctx context.Context, username string) (*Admin, error)
	Create(ctx context.Context, username, passwordHash string) error
	Exists(ctx context.Context) (bool, error)
}

type repository struct {
	db *sql.DB
}

// NewRepository returns a Repository backed by the given *sql.DB.
func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

func (r *repository) FindByUsername(ctx context.Context, username string) (*Admin, error) {
	const q = `
		SELECT id, username, password_hash, created_at
		FROM admin
		WHERE username = $1
		LIMIT 1`

	a := &Admin{}
	err := r.db.QueryRowContext(ctx, q, username).Scan(
		&a.ID, &a.Username, &a.PasswordHash, &a.CreatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("query admin by username: %w", err)
	}
	return a, nil
}

// Create inserts an admin record. ON CONFLICT DO NOTHING makes this idempotent —
// safe to call from concurrent startup processes without returning an error.
func (r *repository) Create(ctx context.Context, username, passwordHash string) error {
	const q = `
		INSERT INTO admin (username, password_hash)
		VALUES ($1, $2)
		ON CONFLICT (username) DO NOTHING`

	if _, err := r.db.ExecContext(ctx, q, username, passwordHash); err != nil {
		return fmt.Errorf("insert admin: %w", err)
	}
	return nil
}

func (r *repository) Exists(ctx context.Context) (bool, error) {
	const q = `SELECT EXISTS(SELECT 1 FROM admin LIMIT 1)`

	var exists bool
	if err := r.db.QueryRowContext(ctx, q).Scan(&exists); err != nil {
		return false, fmt.Errorf("check admin exists: %w", err)
	}
	return exists, nil
}
