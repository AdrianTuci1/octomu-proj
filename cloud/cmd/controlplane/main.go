package main

import (
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/octomus/cloud/internal/api"
	"github.com/octomus/cloud/internal/tunnel"
)

func main() {
	// Initialize Echo
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Initialize Server (initializes Store and internal components)
	server := api.NewServer()
	
	// Initialize Tunnel Manager
	tunnelMgr := tunnel.NewManager()

	// Register API Routes
	server.RegisterRoutes(e)

	// Register Tunnel Routes
	e.GET("/tunnel/connect", tunnelMgr.HandleConnect)
	e.POST("/tunnel/proxy/:clientID/*", tunnelMgr.HandleProxy)
	
	// Start gRPC Server - DISABLED (Stubbed)
	// We are currently running in a mode where gRPC is not fully functional 
	// or needed for the initial HTTP dashboard check.
	// When we have proto files and strict gRPC requirements, we can re-enable this,
	// likely by moving the listener into api.Server or exposing the GRPC server.
	/* 
	go func() {
		grpcPort := os.Getenv("GRPC_PORT")
		if grpcPort == "" {
			grpcPort = "50051"
		}
		lis, err := net.Listen("tcp", ":"+grpcPort)
		if err != nil {
			e.Logger.Fatal("failed to listen on gRPC port: ", err)
		}
		var opts []grpc.ServerOption
		s := grpc.NewServer(opts...)
		// pb.RegisterNodeServiceServer(s, grpcServer) 
		
		e.Logger.Printf("gRPC server listening on :%s", grpcPort)
		if err := s.Serve(lis); err != nil {
			e.Logger.Fatal("failed to serve gRPC: ", err)
		}
	}()
	*/

	// Health Check
	e.GET("/health", func(c echo.Context) error {
		return c.NoContent(http.StatusOK)
	})
	
	e.GET("/", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"status":  "ok",
			"service": "octomus-cloud-controlplane",
			"version": "0.1.1-dynamo",
		})
	})

	// Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	e.Logger.Fatal(e.Start(":" + port))
}
