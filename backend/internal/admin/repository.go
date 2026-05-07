package admin

import (
	"context"
	"database/sql"
	"fmt"
)

// Repository fetches aggregate stats across all domain tables.
type Repository interface {
	GetStats(ctx context.Context) (*Stats, error)
}

type repository struct {
	db *sql.DB
}

// NewRepository returns a Repository backed by the given *sql.DB.
func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetStats(ctx context.Context) (*Stats, error) {
	const q = `
		SELECT
			(SELECT COUNT(*) FROM posts)                             AS total_posts,
			(SELECT COUNT(*) FROM posts WHERE status = 'published') AS published_posts,
			(SELECT COUNT(*) FROM posts WHERE status = 'draft')     AS draft_posts,
			(SELECT COUNT(*) FROM albums)                           AS total_albums,
			(SELECT COUNT(*) FROM photos)                           AS total_photos,
			(SELECT COUNT(*) FROM skills)                           AS total_skills,
			(SELECT COUNT(*) FROM projects)                         AS total_projects`

	var s Stats
	err := r.db.QueryRowContext(ctx, q).Scan(
		&s.TotalPosts,
		&s.PublishedPosts,
		&s.DraftPosts,
		&s.TotalAlbums,
		&s.TotalPhotos,
		&s.TotalSkills,
		&s.TotalProjects,
	)
	if err != nil {
		return nil, fmt.Errorf("get stats: %w", err)
	}
	return &s, nil
}
