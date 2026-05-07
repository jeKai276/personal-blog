package bootstrap

import (
	"context"
	"log"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/yendp/personal-blog/config"
	"github.com/yendp/personal-blog/internal/admin"
	"github.com/yendp/personal-blog/internal/auth"
	"github.com/yendp/personal-blog/internal/blog"
	"github.com/yendp/personal-blog/internal/database"
	"github.com/yendp/personal-blog/internal/middleware"
	"github.com/yendp/personal-blog/internal/photo"
	"github.com/yendp/personal-blog/internal/project"
	"github.com/yendp/personal-blog/internal/skill"
	"github.com/yendp/personal-blog/migrations"
	"github.com/yendp/personal-blog/pkg/storage"
)

var (
	once sync.Once

	Cfg        *config.Config
	AuthSvc    auth.Service
	BlogSvc    blog.Service
	PhotoSvc   photo.Service
	SkillSvc   skill.Service
	ProjectSvc project.Service
	AdminSvc   admin.Service
	Store      storage.Storage
	Router     *gin.Engine
)

// Setup initializes all shared state. Safe to call multiple times — runs once per process.
func Setup() {
	once.Do(func() {
		if err := godotenv.Load(); err != nil {
			log.Println("no .env file found, reading from environment")
		}

		Cfg = config.Load()
		if Cfg.JWTSecret == "" {
			log.Fatal("JWT_SECRET environment variable is required")
		}
		if Cfg.AdminUsername == "" || Cfg.AdminPassword == "" {
			log.Fatal("ADMIN_USERNAME and ADMIN_PASSWORD environment variables are required")
		}

		gin.SetMode(gin.ReleaseMode)

		db, err := database.Connect(Cfg)
		if err != nil {
			log.Fatalf("connect to database: %v", err)
		}

		if err := database.RunMigrations(db, migrations.FS); err != nil {
			log.Fatalf("run migrations: %v", err)
		}

		authRepo := auth.NewRepository(db)
		AuthSvc = auth.NewService(authRepo, Cfg.JWTSecret)

		if err := AuthSvc.SeedAdmin(context.Background(), Cfg.AdminUsername, Cfg.AdminPassword); err != nil {
			log.Fatalf("seed admin: %v", err)
		}

		if Cfg.R2AccountID != "" && Cfg.R2Bucket != "" {
			Store, err = storage.NewR2(
				Cfg.R2AccountID, Cfg.R2Bucket,
				Cfg.R2AccessKeyID, Cfg.R2SecretAccessKey,
				Cfg.R2BaseURL,
			)
			if err != nil {
				log.Printf("warning: init R2 storage: %v", err)
			}
		} else {
			log.Println("warning: R2 not configured — photo upload endpoints will fail")
		}

		blogRepo := blog.NewRepository(db)
		BlogSvc = blog.NewService(blogRepo)

		photoRepo := photo.NewRepository(db)
		PhotoSvc = photo.NewService(photoRepo, Store)

		skillRepo := skill.NewRepository(db)
		SkillSvc = skill.NewService(skillRepo)

		projectRepo := project.NewRepository(db)
		ProjectSvc = project.NewService(projectRepo)

		adminRepo := admin.NewRepository(db)
		AdminSvc = admin.NewService(adminRepo)

		Router = setupRouter()
	})
}

func setupRouter() *gin.Engine {
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.CORS(Cfg.AllowedOrigins))

	authHandler := auth.NewHandler(AuthSvc, Cfg.CookieSecure)
	adminHandler := admin.NewHandler(AdminSvc)
	blogHandler := blog.NewHandler(BlogSvc)
	photoHandler := photo.NewHandler(PhotoSvc, Store)
	skillHandler := skill.NewHandler(SkillSvc)
	projectHandler := project.NewHandler(ProjectSvc)

	v1 := r.Group("/api/v1")
	{
		authGroup := v1.Group("/auth")
		{
			authGroup.POST("/login", middleware.LoginRateLimit(), authHandler.Login)
			authGroup.POST("/logout", authHandler.Logout)
			authGroup.GET("/me", middleware.RequireAuth(AuthSvc), authHandler.Me)
		}

		v1.GET("/posts", blogHandler.List)
		v1.GET("/posts/:slug", blogHandler.GetBySlug)

		v1.GET("/albums", photoHandler.ListAlbums)
		v1.GET("/albums/:id", photoHandler.GetAlbum)

		v1.GET("/skills", skillHandler.List)
		v1.GET("/projects", projectHandler.List)

		adminGroup := v1.Group("/admin", middleware.RequireAuth(AuthSvc))
		{
			adminGroup.GET("/stats", adminHandler.GetStats)

			adminGroup.GET("/posts", blogHandler.ListAll)
			adminGroup.GET("/posts/:id", blogHandler.GetByID)
			adminGroup.POST("/posts", blogHandler.Create)
			adminGroup.PUT("/posts/:id", blogHandler.Update)
			adminGroup.DELETE("/posts/:id", blogHandler.Delete)
			adminGroup.PATCH("/posts/:id/publish", blogHandler.TogglePublish)

			adminGroup.POST("/albums", photoHandler.CreateAlbum)
			adminGroup.PUT("/albums/:id", photoHandler.UpdateAlbum)
			adminGroup.DELETE("/albums/:id", photoHandler.DeleteAlbum)
			adminGroup.POST("/albums/:id/photos", photoHandler.AddPhoto)

			adminGroup.DELETE("/photos/:id", photoHandler.DeletePhoto)
			adminGroup.PATCH("/photos/:id", photoHandler.UpdatePhoto)

			adminGroup.POST("/upload/presigned-url", photoHandler.PresignedURL)
			adminGroup.POST("/upload/presigned-r2-url", photoHandler.PresignedURL)

			adminGroup.POST("/skills", skillHandler.Create)
			adminGroup.PUT("/skills/:id", skillHandler.Update)
			adminGroup.DELETE("/skills/:id", skillHandler.Delete)

			adminGroup.POST("/projects", projectHandler.Create)
			adminGroup.PUT("/projects/:id", projectHandler.Update)
			adminGroup.DELETE("/projects/:id", projectHandler.Delete)
		}
	}

	return r
}
