package skill

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
)

// ErrNotFound is returned when a requested skill does not exist.
var ErrNotFound = errors.New("skill not found")

// Repository defines persistence operations for skills.
type Repository interface {
	Create(ctx context.Context, skill *Skill) (*Skill, error)
	FindByID(ctx context.Context, id int) (*Skill, error)
	List(ctx context.Context) ([]*Skill, error)
	Update(ctx context.Context, skill *Skill) (*Skill, error)
	Delete(ctx context.Context, id int) error
}

type repository struct {
	db *sql.DB
}

// NewRepository creates a new skill Repository backed by a PostgreSQL database.
func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, skill *Skill) (*Skill, error) {
	const q = `
		INSERT INTO skills (name, category, level, icon_url, sort_order)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, name, category, level, icon_url, sort_order`

	row := r.db.QueryRowContext(ctx, q,
		skill.Name, skill.Category, skill.Level, skill.IconURL, skill.SortOrder,
	)
	return scanSkill(row)
}

func (r *repository) FindByID(ctx context.Context, id int) (*Skill, error) {
	const q = `SELECT id, name, category, level, icon_url, sort_order FROM skills WHERE id = $1`
	row := r.db.QueryRowContext(ctx, q, id)
	s, err := scanSkill(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return s, err
}

func (r *repository) List(ctx context.Context) ([]*Skill, error) {
	const q = `SELECT id, name, category, level, icon_url, sort_order FROM skills ORDER BY sort_order ASC`

	rows, err := r.db.QueryContext(ctx, q)
	if err != nil {
		return nil, fmt.Errorf("list skills: %w", err)
	}
	defer rows.Close()

	var skills []*Skill
	for rows.Next() {
		var s Skill
		if err := rows.Scan(&s.ID, &s.Name, &s.Category, &s.Level, &s.IconURL, &s.SortOrder); err != nil {
			return nil, fmt.Errorf("scan skill: %w", err)
		}
		skills = append(skills, &s)
	}
	return skills, rows.Err()
}

func (r *repository) Update(ctx context.Context, skill *Skill) (*Skill, error) {
	const q = `
		UPDATE skills SET name = $1, category = $2, level = $3, icon_url = $4, sort_order = $5
		WHERE id = $6
		RETURNING id, name, category, level, icon_url, sort_order`

	row := r.db.QueryRowContext(ctx, q,
		skill.Name, skill.Category, skill.Level, skill.IconURL, skill.SortOrder, skill.ID,
	)
	s, err := scanSkill(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return s, err
}

func (r *repository) Delete(ctx context.Context, id int) error {
	res, err := r.db.ExecContext(ctx, "DELETE FROM skills WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete skill: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

func scanSkill(row *sql.Row) (*Skill, error) {
	var s Skill
	err := row.Scan(&s.ID, &s.Name, &s.Category, &s.Level, &s.IconURL, &s.SortOrder)
	if err != nil {
		return nil, err
	}
	return &s, nil
}
