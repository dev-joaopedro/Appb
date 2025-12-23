package main

import (
	"barber-app/controllers"
	"barber-app/database"
	"barber-app/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SeedServices() {
	var count int64
	database.DB.Model(&models.Service{}).Count(&count)
	if count == 0 {
		services := []models.Service{
			{Title: "Corte de Cabelo", Price: 35.00, DurationMinutes: 30, Active: true},
			{Title: "Barba Completa", Price: 25.00, DurationMinutes: 20, Active: true},
			{Title: "Combo (Cabelo + Barba)", Price: 50.00, DurationMinutes: 50, Active: true},
			{Title: "Pezinho / Acabamento", Price: 10.00, DurationMinutes: 10, Active: true},
		}
		database.DB.Create(&services)
	}
}

func main() {
	r := gin.Default()

	// Conectar ao banco de dados
	db := database.ConnectDB()

	// Migrações automáticas
	db.AutoMigrate(&models.Service{}, &models.Appointment{}, &models.User{})

	// Seed inicial
	SeedServices()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	// Rotas de Serviços
	r.GET("/services", controllers.GetServices)
	r.POST("/services", controllers.CreateService)
	r.DELETE("/services/:id", controllers.DeleteService)

	// Rotas de Agendamento
	r.POST("/appointments", controllers.CreateAppointment)
	r.GET("/appointments/slots", controllers.GetAvailableSlots)

	// Rotas Admin
	r.GET("/appointments", controllers.GetAppointments)
	r.PUT("/appointments/:id/status", controllers.UpdateAppointmentStatus)

	r.Run(":8080") // Rodar na porta 8080
}
