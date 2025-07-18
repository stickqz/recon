import { pool } from './database';
import { Contact } from './types';

export class ContactRepository {
  async findByEmailOrPhone(email?: string, phoneNumber?: string): Promise<Contact[]> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (email) {
      conditions.push(`email = $${paramIndex++}`);
      params.push(email);
    }

    if (phoneNumber) {
      conditions.push(`phoneNumber = $${paramIndex++}`);
      params.push(phoneNumber);
    }

    if (conditions.length === 0) {
      return [];
    }

    const query = `
      SELECT * FROM Contact 
      WHERE (${conditions.join(' OR ')}) AND deletedAt IS NULL
      ORDER BY createdAt ASC
    `;

    try {
      const result = await pool.query(query, params);
      return result.rows as Contact[];
    } catch (error) {
      console.error('Database error in findByEmailOrPhone:', error);
      return [];
    }
  }

  async create(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const query = `
      INSERT INTO Contact (phoneNumber, email, linkedId, linkPrecedence)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;

    const params = [
      contact.phoneNumber || null,
      contact.email || null,
      contact.linkedId || null,
      contact.linkPrecedence,
    ];

    try {
      const result = await pool.query(query, params);
      return result.rows[0].id;
    } catch (error) {
      console.error('Database error in create:', error);
      throw error;
    }
  }

  async findLinkedContacts(contactIds: number[]): Promise<Contact[]> {
    if (contactIds.length === 0) return [];

    const placeholders = contactIds.map((_, index) => `$${index + 1}`).join(',');
    const doubledContactIds = [...contactIds, ...contactIds];
    const placeholders2 = contactIds.map((_, index) => `$${index + contactIds.length + 1}`).join(',');
    
    const query = `
      SELECT * FROM Contact 
      WHERE (id IN (${placeholders}) OR linkedId IN (${placeholders2})) 
      AND deletedAt IS NULL
      ORDER BY createdAt ASC
    `;

    try {
      const result = await pool.query(query, doubledContactIds);
      return result.rows as Contact[];
    } catch (error) {
      console.error('Database error in findLinkedContacts:', error);
      return [];
    }
  }

  async updateToSecondary(id: number, primaryId: number): Promise<void> {
    const query = `
      UPDATE Contact 
      SET linkPrecedence = 'secondary', linkedId = $1, updatedAt = CURRENT_TIMESTAMP
      WHERE id = $2
    `;

    try {
      await pool.query(query, [primaryId, id]);
    } catch (error) {
      console.error('Database error in updateToSecondary:', error);
      throw error;
    }
  }

  async updateLinkedContacts(oldPrimaryId: number, newPrimaryId: number): Promise<void> {
    const query = `
      UPDATE Contact 
      SET linkedId = $1, updatedAt = CURRENT_TIMESTAMP
      WHERE linkedId = $2
    `;

    try {
      await pool.query(query, [newPrimaryId, oldPrimaryId]);
    } catch (error) {
      console.error('Database error in updateLinkedContacts:', error);
      throw error;
    }
  }
}