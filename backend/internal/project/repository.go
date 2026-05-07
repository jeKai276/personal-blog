package project

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/lib/pq"
)

// ErrNotFound is returned when a requested project does not exist.
var ErrNotFound = errors.New("project not found")

// Repository defines persistence operations for projects.
type Repository interface {
	Create(ctx context.Context, project *Project) (*Project, error)
	FindByID(ctx context.Context, id int) (*Project, error)
	List(ctx context.Context) ([]*Project, error)
	Update(ctx context.Context, project *Project) (*Project, error)
	Delete(ctx context.Context, id int) error
}

type repository struct {
	db *sql.DB
}

// NewRepository creates a new project Repository backed by a PostgreSQL database.
func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, project *Project) (*Project, error) {
	const q = `
		INSERT INTO projects (title, description, tech_stack, github_url, demo_url, cover_image_url, is_featured, sort_order)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, title, description, tech_stack, github_url, demo_url, cover_image_url, is_featured, sort_order`

	row := r.db.QueryRowContext(ctx, q,
		project.Title, project.Description, pq.Array(project.TechStack),
		project.GithubURL, project.DemoURL, project.CoverImageURL,
		project.IsFeatured, project.SortOrder,
	)
	return scanProject(row)
}

func (r *repository) FindByID(ctx context.Context, id int) (*Project, error) {
	const q = `
		SELECT id, title, description, tech_stack, github_url, demo_url, cover_image_url, is_featured, sort_order
		FROM projects WHERE id = $1`

	row := r.db.QueryRowContext(ctx, q, id)
	p, err := scanProject(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return p, err
}

func (r *repository) List(ctx context.Context) ([]*Project, error) {
	const q = `
		SELECT id, title, description, tech_stack, github_url, demo_url, cover_image_url, is_featured, sort_order
		FROM projects ORDER BY is_featured DESC, sort_order ASC`

	rows, err := r.db.QueryContext(ctx, q)
	if err != nil {
		return nil, fmt.Errorf("list projects: %w", err)
	}
	defer rows.Close()

	var projects []*Project
	for rows.Next() {
		p, err := scanProjectRow(rows)
		if err != nil {
			return nil, fmt.Errorf("scan project: %w", err)
		}
		projects = append(projects, p)
	}
	return projects, rows.Err()
}

func (r *repository) Update(ctx context.Context, project *Project) (*Project, error) {
	const q = `
		UPDATE projects
		SET title = $1, description = $2, tech_stack = $3, github_url = $4,
		    demo_url = $5, cover_image_url = $6, is_featured = $7, sort_order = $8
		WHERE id = $9
		RETURNING id, title, description, tech_stack, github_url, demo_url, cover_image_url, is_featured, sort_order`

	row := r.db.QueryRowContext(ctx, q,
		project.Title, project.Description, pq.Array(project.TechStack),
		project.GithubURL, project.DemoURL, project.CoverImageURL,
		project.IsFeatured, project.SortOrder, project.ID,
	)
	p, err := scanProject(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return p, err
}

func (r *repository) Delete(ctx context.Context, id int) error {
	res, err := r.db.ExecContext(ctx, "DELETE FROM projects WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete project: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

func scanProject(row *sql.Row) (*Project, error) {
	var p Project
	var techStack pq.StringArray
	err := row.Scan(
		&p.ID, &p.Title, &p.Description, &techStack,
		&p.GithubURL, &p.DemoURL, &p.CoverImageURL, &p.IsFeatured, &p.SortOrder,
	)
	if err != nil {
		return nil, err
	}
	p.TechStack = []string(techStack)
	return &p, nil
}

func scanProjectRow(rows *sql.Rows) (*Project, error) {
	var p Project
	var techStack pq.StringArray
	err := rows.Scan(
		&p.ID, &p.Title, &p.Description, &techStack,
		&p.GithubURL, &p.DemoURL, &p.CoverImageURL, &p.IsFeatured, &p.SortOrder,
	)
	if err != nil {
		return nil, err
	}
	p.TechStack = []string(techStack)
	return &p, nil
}
