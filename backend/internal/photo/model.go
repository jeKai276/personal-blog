package photo

import "time"

// Album represents a photo album.
type Album struct {
	ID           int        `json:"id"`
	Title        string     `json:"title"`
	Description  string     `json:"description"`
	CoverPhotoID *int       `json:"cover_photo_id"`
	Location     string     `json:"location"`
	TakenAt      *time.Time `json:"taken_at"`
	Photos       []*Photo   `json:"photos,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// Photo represents a single photo within an album.
type Photo struct {
	ID           int       `json:"id"`
	AlbumID      int       `json:"album_id"`
	URL          string    `json:"url"`
	ThumbnailURL string    `json:"thumbnail_url"`
	Caption      string    `json:"caption"`
	Width        int       `json:"width"`
	Height       int       `json:"height"`
	SizeBytes    int64     `json:"size_bytes"`
	SortOrder    int       `json:"sort_order"`
	CreatedAt    time.Time `json:"created_at"`
}

// CreateAlbumRequest is the payload for creating an album.
type CreateAlbumRequest struct {
	Title       string `json:"title"       binding:"required,max=255"`
	Description string `json:"description"`
	Location    string `json:"location"`
	TakenAt     string `json:"taken_at"` // "YYYY-MM-DD", optional
}

// UpdateAlbumRequest is the payload for updating an album.
type UpdateAlbumRequest struct {
	Title        string `json:"title"          binding:"required,max=255"`
	Description  string `json:"description"`
	Location     string `json:"location"`
	TakenAt      string `json:"taken_at"`
	CoverPhotoID *int   `json:"cover_photo_id"`
}

// AddPhotoRequest is the payload for adding a photo to an album.
type AddPhotoRequest struct {
	URL       string `json:"url"       binding:"required"` // S3 key (NOT full URL)
	Caption   string `json:"caption"`
	Width     int    `json:"width"`
	Height    int    `json:"height"`
	SizeBytes int64  `json:"size_bytes"`
}

// UpdatePhotoRequest is the payload for updating photo metadata.
type UpdatePhotoRequest struct {
	Caption   string `json:"caption"`
	SortOrder int    `json:"sort_order"`
}

// PresignedURLRequest is the payload for requesting a presigned upload URL.
type PresignedURLRequest struct {
	Filename    string `json:"filename"     binding:"required"`
	ContentType string `json:"content_type" binding:"required,oneof=image/jpeg image/png image/webp image/gif"`
}
