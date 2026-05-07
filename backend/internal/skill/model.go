package skill

// Skill represents a technical skill shown on the profile.
type Skill struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Category  string `json:"category"`
	Level     int    `json:"level"`
	IconURL   string `json:"icon_url"`
	SortOrder int    `json:"sort_order"`
}

// CreateSkillRequest is the payload for creating a skill.
type CreateSkillRequest struct {
	Name      string `json:"name"       binding:"required,max=100"`
	Category  string `json:"category"   binding:"required,oneof=backend frontend devops other"`
	Level     int    `json:"level"      binding:"required,min=1,max=5"`
	IconURL   string `json:"icon_url"`
	SortOrder int    `json:"sort_order"`
}

// UpdateSkillRequest is the payload for updating a skill.
type UpdateSkillRequest struct {
	Name      string `json:"name"       binding:"required,max=100"`
	Category  string `json:"category"   binding:"required,oneof=backend frontend devops other"`
	Level     int    `json:"level"      binding:"required,min=1,max=5"`
	IconURL   string `json:"icon_url"`
	SortOrder int    `json:"sort_order"`
}
