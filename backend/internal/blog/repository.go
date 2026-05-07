package blog

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/lib/pq"
)

// ErrNotFound is returned when a requested post does not exist.
var ErrNotFound = errors.New("post not found")

// Repository defines persistence operations for blog posts.
type Repository interface {
	Create(ctx context.Context, post *Post) (*Post, error)
	FindByID(ctx context.Context, id int) (*Post, error)
	FindBySlug(ctx context.Context, slug string) (*Post, error)
	List(ctx context.Context, params ListPostsParams) ([]*Post, int, error)
	Update(ctx context.Context, post *Post) (*Post, error)
	Delete(ctx context.Context, id int) error
	SlugExists(ctx context.Context, slug string) (bool, error)
}

type repository struct {
	db *sql.DB
}

// NewRepository creates a new blog Repository backed by a PostgreSQL database.
func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, post *Post) (*Post, error) {
	const q = `
		INSERT INTO posts (title, slug, content, excerpt, cover_image_url, status, tags)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, title, slug, content, excerpt, cover_image_url, status, tags,
		          published_at, created_at, updated_at`

	row := r.db.QueryRowContext(ctx, q,
		post.Title,
		post.Slug,
		post.Content,
		post.Excerpt,
		post.CoverImageURL,
		post.Status,
		pq.Array(post.Tags),
	)

	return scanPost(row)
}

func (r *repository) FindByID(ctx context.Context, id int) (*Post, error) {
	const q = `
		SELECT id, title, slug, content, excerpt, cover_image_url, status, tags,
		       published_at, created_at, updated_at
		FROM posts WHERE id = $1`

	row := r.db.QueryRowContext(ctx, q, id)
	p, err := scanPost(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return p, err
}

func (r *repository) FindBySlug(ctx context.Context, slug string) (*Post, error) {
	const q = `
		SELECT id, title, slug, content, excerpt, cover_image_url, status, tags,
		       published_at, created_at, updated_at
		FROM posts WHERE slug = $1 AND status = 'published'`

	row := r.db.QueryRowContext(ctx, q, slug)
	p, err := scanPost(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return p, err
}

func (r *repository) List(ctx context.Context, params ListPostsParams) ([]*Post, int, error) {
	// Build WHERE clause.
	where := ""
	args := []interface{}{}
	argIdx := 1

	if params.Status != "all" {
		where += fmt.Sprintf(" WHERE status = $%d", argIdx)
		args = append(args, params.Status)
		argIdx++
	}

	if params.Tag != "" {
		if where == "" {
			where += fmt.Sprintf(" WHERE $%d = ANY(tags)", argIdx)
		} else {
			where += fmt.Sprintf(" AND $%d = ANY(tags)", argIdx)
		}
		args = append(args, params.Tag)
		argIdx++
	}

	// Count query.
	countQ := "SELECT COUNT(*) FROM posts" + where
	var total int
	if err := r.db.QueryRowContext(ctx, countQ, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("count posts: %w", err)
	}

	// Pagination.
	if params.Limit <= 0 {
		params.Limit = 10
	}
	if params.Limit > 50 {
		params.Limit = 50
	}
	if params.Page < 1 {
		params.Page = 1
	}
	offset := (params.Page - 1) * params.Limit

	listQ := `SELECT id, title, slug, content, excerpt, cover_image_url, status, tags,
	                 published_at, created_at, updated_at
	          FROM posts` + where +
		fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d OFFSET $%d", argIdx, argIdx+1)
	args = append(args, params.Limit, offset)

	rows, err := r.db.QueryContext(ctx, listQ, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list posts: %w", err)
	}
	defer rows.Close()

	var posts []*Post
	for rows.Next() {
		p, err := scanPostRow(rows)
		if err != nil {
			return nil, 0, fmt.Errorf("scan post: %w", err)
		}
		posts = append(posts, p)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("iterate posts: %w", err)
	}

	return posts, total, nil
}

func (r *repository) Update(ctx context.Context, post *Post) (*Post, error) {
	const q = `
		UPDATE posts
		SET title = $1, content = $2, excerpt = $3, cover_image_url = $4,
		    status = $5, tags = $6, published_at = $7
		WHERE id = $8
		RETURNING id, title, slug, content, excerpt, cover_image_url, status, tags,
		          published_at, created_at, updated_at`

	row := r.db.QueryRowContext(ctx, q,
		post.Title,
		post.Content,
		post.Excerpt,
		post.CoverImageURL,
		post.Status,
		pq.Array(post.Tags),
		post.PublishedAt,
		post.ID,
	)

	p, err := scanPost(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return p, err
}

func (r *repository) Delete(ctx context.Context, id int) error {
	res, err := r.db.ExecContext(ctx, "DELETE FROM posts WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete post: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *repository) SlugExists(ctx context.Context, slug string) (bool, error) {
	var exists bool
	err := r.db.QueryRowContext(ctx,
		"SELECT EXISTS(SELECT 1 FROM posts WHERE slug = $1)", slug,
	).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("check slug: %w", err)
	}
	return exists, nil
}

// scanPost scans a single *sql.Row into a Post.
func scanPost(row *sql.Row) (*Post, error) {
	var p Post
	var tags pq.StringArray
	err := row.Scan(
		&p.ID, &p.Title, &p.Slug, &p.Content, &p.Excerpt,
		&p.CoverImageURL, &p.Status, &tags,
		&p.PublishedAt, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	p.Tags = []string(tags)
	return &p, nil
}

// scanPostRow scans a *sql.Rows row into a Post.
func scanPostRow(rows *sql.Rows) (*Post, error) {
	var p Post
	var tags pq.StringArray
	err := rows.Scan(
		&p.ID, &p.Title, &p.Slug, &p.Content, &p.Excerpt,
		&p.CoverImageURL, &p.Status, &tags,
		&p.PublishedAt, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	p.Tags = []string(tags)
	return &p, nil
}
