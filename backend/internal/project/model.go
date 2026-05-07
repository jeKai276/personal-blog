package project

// Project represents a portfolio project.
type Project struct {
	ID            int      `json:"id"`
	Title         string   `json:"title"`
	Description   string   `json:"description"`
	TechStack     []string `json:"tech_stack"`
	GithubURL     string   `json:"github_url"`
	DemoURL       string   `json:"demo_url"`
	CoverImageURL string   `json:"cover_image_url"`
	IsFeatured    bool     `json:"is_featured"`
	SortOrder     int      `json:"sort_order"`
}

// CreateProjectRequest is the payload for creating a project.
type CreateProjectRequest struct {
	Title         string   `json:"title"           binding:"required,max=255"`
	Description   string   `json:"description"`
	TechStack     []string `json:"tech_stack"`
	GithubURL     string   `json:"github_url"`
	DemoURL       string   `json:"demo_url"`
	CoverImageURL string   `json:"cover_image_url"`
	IsFeatured    bool     `json:"is_featured"`
	SortOrder     int      `json:"sort_order"`
}

// UpdateProjectRequest is the payload for updating a project.
type UpdateProjectRequest struct {
	Title         string   `json:"title"           binding:"required,max=255"`
	Description   string   `json:"description"`
	TechStack     []string `json:"tech_stack"`
	GithubURL     string   `json:"github_url"`
	DemoURL       string   `json:"demo_url"`
	CoverImageURL string   `json:"cover_image_url"`
	IsFeatured    bool     `json:"is_featured"`
	SortOrder     int      `json:"sort_order"`
}
