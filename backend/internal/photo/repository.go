package photo

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"
)

// ErrNotFound is returned when a requested album or photo does not exist.
var ErrNotFound = errors.New("not found")

// Repository defines persistence operations for albums and photos.
type Repository interface {
	// Album operations
	CreateAlbum(ctx context.Context, album *Album) (*Album, error)
	FindAlbumByID(ctx context.Context, id int) (*Album, error) // includes photos
	ListAlbums(ctx context.Context) ([]*Album, error)
	UpdateAlbum(ctx context.Context, album *Album) (*Album, error)
	DeleteAlbum(ctx context.Context, id int) error

	// Photo operations
	CreatePhoto(ctx context.Context, photo *Photo) (*Photo, error)
	FindPhotoByID(ctx context.Context, id int) (*Photo, error)
	ListPhotosByAlbum(ctx context.Context, albumID int) ([]*Photo, error)
	UpdatePhoto(ctx context.Context, photo *Photo) (*Photo, error)
	DeletePhoto(ctx context.Context, id int) error
}

type repository struct {
	db *sql.DB
}

// NewRepository creates a new photo Repository backed by a PostgreSQL database.
func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

// ---- Album operations ----

func (r *repository) CreateAlbum(ctx context.Context, album *Album) (*Album, error) {
	const q = `
		INSERT INTO albums (title, description, location, taken_at)
		VALUES ($1, $2, $3, $4)
		RETURNING id, title, description, cover_photo_id, location, taken_at, created_at, updated_at`

	row := r.db.QueryRowContext(ctx, q,
		album.Title, album.Description, album.Location, album.TakenAt,
	)
	return scanAlbum(row)
}

func (r *repository) FindAlbumByID(ctx context.Context, id int) (*Album, error) {
	const q = `
		SELECT id, title, description, cover_photo_id, location, taken_at, created_at, updated_at
		FROM albums WHERE id = $1`

	row := r.db.QueryRowContext(ctx, q, id)
	album, err := scanAlbum(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	photos, err := r.ListPhotosByAlbum(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("list photos for album %d: %w", id, err)
	}
	album.Photos = photos
	return album, nil
}

func (r *repository) ListAlbums(ctx context.Context) ([]*Album, error) {
	const q = `
		SELECT id, title, description, cover_photo_id, location, taken_at, created_at, updated_at
		FROM albums ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, q)
	if err != nil {
		return nil, fmt.Errorf("list albums: %w", err)
	}
	defer rows.Close()

	var albums []*Album
	for rows.Next() {
		a, err := scanAlbumRow(rows)
		if err != nil {
			return nil, fmt.Errorf("scan album: %w", err)
		}
		albums = append(albums, a)
	}
	return albums, rows.Err()
}

func (r *repository) UpdateAlbum(ctx context.Context, album *Album) (*Album, error) {
	const q = `
		UPDATE albums
		SET title = $1, description = $2, location = $3, taken_at = $4, cover_photo_id = $5
		WHERE id = $6
		RETURNING id, title, description, cover_photo_id, location, taken_at, created_at, updated_at`

	row := r.db.QueryRowContext(ctx, q,
		album.Title, album.Description, album.Location, album.TakenAt,
		album.CoverPhotoID, album.ID,
	)
	a, err := scanAlbum(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return a, err
}

func (r *repository) DeleteAlbum(ctx context.Context, id int) error {
	res, err := r.db.ExecContext(ctx, "DELETE FROM albums WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete album: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// ---- Photo operations ----

func (r *repository) CreatePhoto(ctx context.Context, photo *Photo) (*Photo, error) {
	const q = `
		INSERT INTO photos (album_id, url, thumbnail_url, caption, width, height, size_bytes, sort_order)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, album_id, url, thumbnail_url, caption, width, height, size_bytes, sort_order, created_at`

	row := r.db.QueryRowContext(ctx, q,
		photo.AlbumID, photo.URL, photo.ThumbnailURL, photo.Caption,
		photo.Width, photo.Height, photo.SizeBytes, photo.SortOrder,
	)
	return scanPhoto(row)
}

func (r *repository) FindPhotoByID(ctx context.Context, id int) (*Photo, error) {
	const q = `
		SELECT id, album_id, url, thumbnail_url, caption, width, height, size_bytes, sort_order, created_at
		FROM photos WHERE id = $1`

	row := r.db.QueryRowContext(ctx, q, id)
	p, err := scanPhoto(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return p, err
}

func (r *repository) ListPhotosByAlbum(ctx context.Context, albumID int) ([]*Photo, error) {
	const q = `
		SELECT id, album_id, url, thumbnail_url, caption, width, height, size_bytes, sort_order, created_at
		FROM photos WHERE album_id = $1 ORDER BY sort_order ASC, id ASC`

	rows, err := r.db.QueryContext(ctx, q, albumID)
	if err != nil {
		return nil, fmt.Errorf("list photos: %w", err)
	}
	defer rows.Close()

	var photos []*Photo
	for rows.Next() {
		p, err := scanPhotoRow(rows)
		if err != nil {
			return nil, fmt.Errorf("scan photo: %w", err)
		}
		photos = append(photos, p)
	}
	return photos, rows.Err()
}

func (r *repository) UpdatePhoto(ctx context.Context, photo *Photo) (*Photo, error) {
	const q = `
		UPDATE photos SET caption = $1, sort_order = $2
		WHERE id = $3
		RETURNING id, album_id, url, thumbnail_url, caption, width, height, size_bytes, sort_order, created_at`

	row := r.db.QueryRowContext(ctx, q, photo.Caption, photo.SortOrder, photo.ID)
	p, err := scanPhoto(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return p, err
}

func (r *repository) DeletePhoto(ctx context.Context, id int) error {
	res, err := r.db.ExecContext(ctx, "DELETE FROM photos WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete photo: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// ---- Scan helpers ----

func scanAlbum(row *sql.Row) (*Album, error) {
	var a Album
	var takenAt sql.NullTime
	err := row.Scan(
		&a.ID, &a.Title, &a.Description, &a.CoverPhotoID,
		&a.Location, &takenAt, &a.CreatedAt, &a.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	if takenAt.Valid {
		t := takenAt.Time
		a.TakenAt = &t
	}
	return &a, nil
}

func scanAlbumRow(rows *sql.Rows) (*Album, error) {
	var a Album
	var takenAt sql.NullTime
	err := rows.Scan(
		&a.ID, &a.Title, &a.Description, &a.CoverPhotoID,
		&a.Location, &takenAt, &a.CreatedAt, &a.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	if takenAt.Valid {
		t := takenAt.Time
		a.TakenAt = &t
	}
	return &a, nil
}

func scanPhoto(row *sql.Row) (*Photo, error) {
	var p Photo
	err := row.Scan(
		&p.ID, &p.AlbumID, &p.URL, &p.ThumbnailURL, &p.Caption,
		&p.Width, &p.Height, &p.SizeBytes, &p.SortOrder, &p.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func scanPhotoRow(rows *sql.Rows) (*Photo, error) {
	var p Photo
	err := rows.Scan(
		&p.ID, &p.AlbumID, &p.URL, &p.ThumbnailURL, &p.Caption,
		&p.Width, &p.Height, &p.SizeBytes, &p.SortOrder, &p.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// parseTakenAt parses an optional "YYYY-MM-DD" string into *time.Time.
func parseTakenAt(s string) (*time.Time, error) {
	if s == "" {
		return nil, nil
	}
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return nil, fmt.Errorf("invalid date format (expected YYYY-MM-DD): %w", err)
	}
	return &t, nil
}
