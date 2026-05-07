package admin

// Stats holds aggregated counts for the admin dashboard.
type Stats struct {
	TotalPosts     int `json:"total_posts"`
	PublishedPosts int `json:"published_posts"`
	DraftPosts     int `json:"draft_posts"`
	TotalAlbums    int `json:"total_albums"`
	TotalPhotos    int `json:"total_photos"`
	TotalSkills    int `json:"total_skills"`
	TotalProjects  int `json:"total_projects"`
}
