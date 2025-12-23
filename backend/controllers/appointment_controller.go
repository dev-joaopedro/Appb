package controllers

import (
	"barber-app/database"
	"barber-app/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// CreateAppointment cria um novo agendamento
func CreateAppointment(c *gin.Context) {
	var input struct {
		ClientName      string    `json:"client_name" binding:"required"`
		ClientPhone     string    `json:"client_phone" binding:"required"`
		ServiceID       uint      `json:"service_id" binding:"required"`
		BarberPhone     string    `json:"barber_phone"`
		AppointmentTime time.Time `json:"appointment_time" binding:"required"`
		Notes           string    `json:"notes"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Se informado, buscar o barbeiro pelo telefone
	var barber *models.User
	if input.BarberPhone != "" {
		var u models.User
		if err := database.DB.Where("phone = ?", input.BarberPhone).First(&u).Error; err == nil {
			barber = &u
		}
	}

	// Verificar se o horário está livre (considerando barbeiro, se informado)
	var count int64
	q := database.DB.Model(&models.Appointment{}).
		Where("appointment_time = ? AND status != 'CANCELED'", input.AppointmentTime)
	if barber != nil {
		q = q.Where("barber_id = ?", barber.ID)
	}
	q.Count(&count)

	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Horário indisponível"})
		return
	}

	appointment := models.Appointment{
		ClientName:      input.ClientName,
		ClientPhone:     input.ClientPhone,
		ServiceID:       input.ServiceID,
		BarberID:        nil,
		AppointmentTime: input.AppointmentTime,
		Notes:           input.Notes,
		Status:          "PENDING",
	}

	if err := database.DB.Create(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar agendamento"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": appointment})
}

// GetAvailableSlots retorna horários livres para uma data
func GetAvailableSlots(c *gin.Context) {
	dateStr := c.Query("date") // Formato YYYY-MM-DD
	barberPhone := c.Query("barber_phone")
	if dateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data é obrigatória"})
		return
	}

	parsedDate, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido (use YYYY-MM-DD)"})
		return
	}

	// Configuração: Barbearia abre 09:00 e fecha 18:00
	startHour := 9
	endHour := 18
	intervalMinutes := 30

	// Buscar agendamentos do dia (filtrando por barbeiro se informado)
	var appointments []models.Appointment
	startTime := parsedDate.Add(time.Duration(startHour) * time.Hour)
	endTime := parsedDate.Add(time.Duration(endHour) * time.Hour)

	q := database.DB.Where("appointment_time >= ? AND appointment_time < ? AND status != 'CANCELED'", startTime, endTime)
	if barberPhone != "" {
		var u models.User
		if err := database.DB.Where("phone = ?", barberPhone).First(&u).Error; err == nil {
			q = q.Where("barber_id = ?", u.ID)
		}
	}

	q.Find(&appointments)

	// Criar mapa de horários ocupados
	busySlots := make(map[string]bool)
	for _, app := range appointments {
		// Formatar hora para comparar (HH:mm)
		busySlots[app.AppointmentTime.Format("15:04")] = true
	}

	// Gerar slots disponíveis
	var availableSlots []string
	current := startTime
	for current.Before(endTime) {
		timeStr := current.Format("15:04")
		if !busySlots[timeStr] {
			availableSlots = append(availableSlots, timeStr)
		}
		current = current.Add(time.Duration(intervalMinutes) * time.Minute)
	}

	c.JSON(http.StatusOK, gin.H{"date": dateStr, "slots": availableSlots})
}
