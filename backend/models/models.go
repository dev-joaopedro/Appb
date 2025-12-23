package models

import (
	"time"

	"gorm.io/gorm"
)

type Service struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	Title           string         `json:"title"`
	Price           float64        `json:"price"`
	DurationMinutes int            `json:"duration_minutes"`
	Active          bool           `json:"active" gorm:"default:true"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

type User struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Name         string         `json:"name"`
	Phone        string         `json:"phone"`
	PasswordHash string         `json:"-"`
	IsAdmin      bool           `json:"is_admin" gorm:"default:false"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

type Appointment struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	ClientName      string         `json:"client_name"`
	ClientPhone     string         `json:"client_phone"`
	ServiceID       uint           `json:"service_id"`
	Service         Service        `json:"service"`
	BarberID        *uint          `json:"barber_id"` // Ponteiro pois pode ser nulo (qualquer barbeiro)
	Barber          *User          `json:"barber"`
	AppointmentTime time.Time      `json:"appointment_time"`
	Status          string         `json:"status" gorm:"default:'PENDING'"` // PENDING, CONFIRMED, CANCELED, DONE
	Notes           string         `json:"notes"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}
