CREATE DATABASE IF NOT EXISTS identity_reconciliation;
USE identity_reconciliation;

-- PostgreSQL Schema for Identity Reconciliation

CREATE TABLE IF NOT EXISTS Contact (
    id SERIAL PRIMARY KEY,
    phoneNumber VARCHAR(20),
    email VARCHAR(255),
    linkedId INTEGER,
    linkPrecedence VARCHAR(20) NOT NULL CHECK (linkPrecedence IN ('primary', 'secondary')),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP DEFAULT NULL,
    
    FOREIGN KEY (linkedId) REFERENCES Contact(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_email ON Contact(email);
CREATE INDEX IF NOT EXISTS idx_contact_phone ON Contact(phoneNumber);
CREATE INDEX IF NOT EXISTS idx_contact_linked_id ON Contact(linkedId);
CREATE INDEX IF NOT EXISTS idx_contact_precedence ON Contact(linkPrecedence);

-- Create a function to update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updatedAt
DROP TRIGGER IF EXISTS update_contact_updated_at ON Contact;
CREATE TRIGGER update_contact_updated_at
    BEFORE UPDATE ON Contact
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
