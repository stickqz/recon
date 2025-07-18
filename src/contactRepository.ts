import { pool } from './database';
import { Contact } from './types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class ContactRepository {
  async findByEmailOrPhone(email?: string, phoneNumber?: string): Promise<Contact[]> {
    const conditions: string[] = [];
    const params: any[] = [];

    if (email) {
      conditions.push('email = ?');
      params.push(email);
    }

    if (phoneNumber) {
      conditions.push('phoneNumber = ?');
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
      const [rows] = await pool.execute<RowDataPacket[]>(query, params);
      return rows as Contact[];
    } catch (error) {
      console.error('Database error in findByEmailOrPhone:', error);
      return [];
    }
  }

  async create(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const query = `
      INSERT INTO Contact (phoneNumber, email, linkedId, linkPrecedence)
      VALUES (?, ?, ?, ?)
    `;

    const params = [
      contact.phoneNumber || null,
      contact.email || null,
      contact.linkedId || null,
      contact.linkPrecedence,
    ];

    try {
      const [result] = await pool.execute<ResultSetHeader>(query, params);
      return result.insertId;
    } catch (error) {
      console.error('Database error in create:', error);
      throw error;
    }
  }

  async findLinkedContacts(contactIds: number[]): Promise<Contact[]> {
    if (contactIds.length === 0) return [];

    const placeholders = contactIds.map(() => '?').join(',');
    const query = `
      SELECT * FROM Contact 
      WHERE (id IN (${placeholders}) OR linkedId IN (${placeholders})) 
      AND deletedAt IS NULL
      ORDER BY createdAt ASC
    `;

    try {
      const params = [...contactIds, ...contactIds];
      const [rows] = await pool.execute<RowDataPacket[]>(query, params);
      return rows as Contact[];
    } catch (error) {
      console.error('Database error in findLinkedContacts:', error);
      return [];
    }
  }

  async updateToSecondary(id: number, primaryId: number): Promise<void> {
    const query = `
      UPDATE Contact 
      SET linkPrecedence = 'secondary', linkedId = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    try {
      await pool.execute(query, [primaryId, id]);
    } catch (error) {
      console.error('Database error in updateToSecondary:', error);
      throw error;
    }
  }

  async updateLinkedContacts(oldPrimaryId: number, newPrimaryId: number): Promise<void> {
    const query = `
      UPDATE Contact 
      SET linkedId = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE linkedId = ?
    `;

    try {
      await pool.execute(query, [newPrimaryId, oldPrimaryId]);
    } catch (error) {
      console.error('Database error in updateLinkedContacts:', error);
      throw error;
    }
  }
}