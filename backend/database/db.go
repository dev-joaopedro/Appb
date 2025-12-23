package database

import (
	"fmt"
	"log"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() *gorm.DB {
	// Usando SQLite para MVP pois Docker não está disponível
	db, err := gorm.Open(sqlite.Open("barber.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Falha ao conectar ao banco de dados:", err)
	}

	fmt.Println("Conectado ao banco de dados SQLite com sucesso!")
	DB = db
	return db
}
