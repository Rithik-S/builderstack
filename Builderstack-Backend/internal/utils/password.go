package utils

import (
	"golang.org/x/crypto/bcrypt"
)

// HashPassword takes a plain password and returns a hashed version
// Used during REGISTRATION
func HashPassword(password string) (string, error) {

	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// CheckPassword compares a plain password with a hash
// Used during LOGIN
// Returns true if they match, false if they don't
func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
