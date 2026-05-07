package main

import (
	"context"
	"fmt"
	"log"

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

func main() {
	// 1. Load .env file (ignore error if file not present — env vars may already be set).
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found, reading from environment")
	}

	// 2. Load config.
	cfg := config.Load()
	if cfg.JWTSecret == "" {
		log.Fatal("JWT_SECRET environment variable is required")
	}
	if cfg.AdminUsername == "" || cfg.AdminPassword == "" {
		log.Fatal("ADMIN_USERNAME and ADMIN_PASSWORD environment variables are required")
	}
	if cfg.R2AccountID == "" || cfg.R2Bucket == "" {
		log.Println("warning: R2 not configured — photo upload endpoints will fail at runtime")
	}

	// 3. Connect to database.
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("connect to database: %v", err)
	}
	defer db.Close()
	log.Println("database connection established")

	// 4. Run migrations from embedded FS (binary carries its own migrations).
	if err := database.RunMigrations(db, migrations.FS); err != nil {
		log.Fatalf("run migrations: %v", err)
	}
	log.Println("migrations applied successfully")

	// 5. Seed admin from env (idempotent — safe to run on every startup).
	authRepo := auth.NewRepository(db)
	authSvc := auth.NewService(authRepo, cfg.JWTSecret)

	if err := authSvc.SeedAdmin(context.Background(), cfg.AdminUsername, cfg.AdminPassword); err != nil {
		log.Fatalf("seed admin: %v", err)
	}
	log.Println("admin account ready")

	// 6. Initialize storage: prefer R2, fall back to S3.
	var store storage.Storage
	var storageErr error
	if cfg.R2AccountID != "" && cfg.R2Bucket != "" {
		store, storageErr = storage.NewR2(
			cfg.R2AccountID, cfg.R2Bucket,
			cfg.R2AccessKeyID, cfg.R2SecretAccessKey,
			cfg.R2BaseURL,
		)
		if storageErr != nil {
			log.Fatalf("init R2 storage: %v", storageErr)
		}
		log.Println("using Cloudflare R2 storage")
	} else {
		store, storageErr = storage.New(
			cfg.AWSS3Region, cfg.AWSS3Bucket,
			cfg.AWSAccessKeyID, cfg.AWSSecretAccessKey,
			cfg.AWSS3BaseURL,
		)
		if storageErr != nil {
			log.Fatalf("init S3 storage: %v", storageErr)
		}
		log.Println("using AWS S3 storage")
	}

	// 7. Wire repos + services.
	adminRepo := admin.NewRepository(db)
	adminSvc := admin.NewService(adminRepo)

	blogRepo := blog.NewRepository(db)
	blogSvc := blog.NewService(blogRepo)

	photoRepo := photo.NewRepository(db)
	photoSvc := photo.NewService(photoRepo, store)

	skillRepo := skill.NewRepository(db)
	skillSvc := skill.NewService(skillRepo)

	projectRepo := project.NewRepository(db)
	projectSvc := project.NewService(projectRepo)

	// 8. Wire handlers.
	adminHandler := admin.NewHandler(adminSvc)
	blogHandler := blog.NewHandler(blogSvc)
	photoHandler := photo.NewHandler(photoSvc, store)
	skillHandler := skill.NewHandler(skillSvc)
	projectHandler := project.NewHandler(projectSvc)

	// 9. Setup Gin router.
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(middleware.CORS(cfg.AllowedOrigins))

	// 10. Register routes.
	authHandler := auth.NewHandler(authSvc, cfg.CookieSecure)

	v1 := router.Group("/api/v1")
	{
		// Auth routes.
		authGroup := v1.Group("/auth")
		{
			authGroup.POST("/login", middleware.LoginRateLimit(), authHandler.Login)
			authGroup.POST("/logout", authHandler.Logout)
			authGroup.GET("/me", middleware.RequireAuth(authSvc), authHandler.Me)
		}

		// Public blog.
		v1.GET("/posts", blogHandler.List)
		v1.GET("/posts/:slug", blogHandler.GetBySlug)

		// Public photos.
		v1.GET("/albums", photoHandler.ListAlbums)
		v1.GET("/albums/:id", photoHandler.GetAlbum)

		// Public profile.
		v1.GET("/skills", skillHandler.List)
		v1.GET("/projects", projectHandler.List)

		// Admin routes (all require authentication).
		adminGroup := v1.Group("/admin", middleware.RequireAuth(authSvc))
		{
			// Dashboard stats.
			adminGroup.GET("/stats", adminHandler.GetStats)

			// Blog admin.
			adminGroup.GET("/posts", blogHandler.ListAll)
			adminGroup.GET("/posts/:id", blogHandler.GetByID)
			adminGroup.POST("/posts", blogHandler.Create)
			adminGroup.PUT("/posts/:id", blogHandler.Update)
			adminGroup.DELETE("/posts/:id", blogHandler.Delete)
			adminGroup.PATCH("/posts/:id/publish", blogHandler.TogglePublish)

			// Album admin.
			adminGroup.POST("/albums", photoHandler.CreateAlbum)
			adminGroup.PUT("/albums/:id", photoHandler.UpdateAlbum)
			adminGroup.DELETE("/albums/:id", photoHandler.DeleteAlbum)
			adminGroup.POST("/albums/:id/photos", photoHandler.AddPhoto)

			// Photo admin.
			adminGroup.DELETE("/photos/:id", photoHandler.DeletePhoto)
			adminGroup.PATCH("/photos/:id", photoHandler.UpdatePhoto)

			// Upload.
			adminGroup.POST("/upload/presigned-url", photoHandler.PresignedURL)
			adminGroup.POST("/upload/presigned-r2-url", photoHandler.PresignedURL)

			// Skill admin.
			adminGroup.POST("/skills", skillHandler.Create)
			adminGroup.PUT("/skills/:id", skillHandler.Update)
			adminGroup.DELETE("/skills/:id", skillHandler.Delete)

			// Project admin.
			adminGroup.POST("/projects", projectHandler.Create)
			adminGroup.PUT("/projects/:id", projectHandler.Update)
			adminGroup.DELETE("/projects/:id", projectHandler.Delete)
		}
	}

	// 11. Start server.
	addr := fmt.Sprintf(":%s", cfg.ServerPort)
	log.Printf("server starting on %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("start server: %v", err)
	}
}
