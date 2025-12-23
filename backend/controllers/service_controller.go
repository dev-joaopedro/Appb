package controllers

import (
	"barber-app/database"
	"barber-app/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateService cria um novo serviço no banco de dados
func CreateService(c *gin.Context) {
	var input models.Service

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	service := models.Service{
		Title:           input.Title,
		Price:           input.Price,
		DurationMinutes: input.DurationMinutes,
		Active:          true,
	}

	database.DB.Create(&service)

	c.JSON(http.StatusCreated, gin.H{"data": service})
}

// GetServices lista todos os serviços ativos
func GetServices(c *gin.Context) {
	var services []models.Service
	database.DB.Where("active = ?", true).Find(&services)

	c.JSON(http.StatusOK, gin.H{"data": services})
}

// DeleteService desativa um serviço (soft delete)
func DeleteService(c *gin.Context) {
	id := c.Param("id")
	var service models.Service

	if err := database.DB.First(&service, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}

	// Soft delete: apenas marca como inativo
	service.Active = false
	database.DB.Save(&service)

	c.JSON(http.StatusOK, gin.H{"data": true})
}
