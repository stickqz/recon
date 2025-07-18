CREATE DATABASE IF NOT EXISTS identity_reconciliation;
USE identity_reconciliation;

CREATE TABLE Contact (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phoneNumber VARCHAR(20),
  email VARCHAR(255),
  linkedId INT,
  linkPrecedence ENUM('primary', 'secondary') NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP NULL,
  
  INDEX idx_phone (phoneNumber),
  INDEX idx_email (email),
  INDEX idx_linked_id (linkedId)
);
