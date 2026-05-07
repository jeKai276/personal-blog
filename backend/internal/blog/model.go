package blog

import "time"

// Post represents a blog post.
type Post struct {
	ID            int        `json:"id"`
	Title         string     `json:"title"`
	Slug          string     `json:"slug"`
	Content       string     `json:"content"`
	Excerpt       string     `json:"excerpt"`
	CoverImageURL string     `json:"cover_image_url"`
	Status        string     `json:"status"`
	Tags          []string   `json:"tags"`
	PublishedAt   *time.Time `json:"published_at"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

// CreatePostRequest is the payload for creating a new post.
type CreatePostRequest struct {
	Title         string   `json:"title"          binding:"required,max=255"`
	Content       string   `json:"content"        binding:"required"`
	Excerpt       string   `json:"excerpt"`
	CoverImageURL string   `json:"cover_image_url"`
	Tags          []string `json:"tags"`
}

// UpdatePostRequest is the payload for updating an existing post.
type UpdatePostRequest struct {
	Title         string   `json:"title"          binding:"required,max=255"`
	Content       string   `json:"content"        binding:"required"`
	Excerpt       string   `json:"excerpt"`
	CoverImageURL string   `json:"cover_image_url"`
	Tags          []string `json:"tags"`
}

// ListPostsParams holds filtering and pagination options.
type ListPostsParams struct {
	Tag    string
	Page   int    // 1-based
	Limit  int    // default 10, max 50
	Status string // empty = published only (public), "all" = all (admin)
}
