package controllers

import (
	"barber-app/database"
	"barber-app/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// UpdateAppointmentStatus atualiza o status de um agendamento
func UpdateAppointmentStatus(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var appointment models.Appointment
	if err := database.DB.First(&appointment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Agendamento não encontrado"})
		return
	}

	appointment.Status = input.Status
	database.DB.Save(&appointment)

	c.JSON(http.StatusOK, gin.H{"data": appointment})
}

// GetAppointments lista todos os agendamentos (para admin)
func GetAppointments(c *gin.Context) {
	var appointments []models.Appointment
	// Carregar relacionamento com Serviço
	database.DB.Preload("Service").Order("appointment_time desc").Find(&appointments)

	c.JSON(http.StatusOK, gin.H{"data": appointments})
}
