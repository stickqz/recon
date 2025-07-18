import * as fs from 'fs/promises';
import * as path from 'path';
import { Contact } from './types';

export class MockContactRepository {
  private filePath = path.join(__dirname, '..', 'contacts.json');
  private nextId = 1;

  private async loadContacts(): Promise<Contact[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      const contacts = JSON.parse(data);
      // Update nextId based on existing contacts
      if (contacts.length > 0) {
        this.nextId = Math.max(...contacts.map((c: Contact) => c.id)) + 1;
      }
      return contacts;
    } catch (error) {
      return [];
    }
  }

  private async saveContacts(contacts: Contact[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(contacts, null, 2));
  }

  async findByEmailOrPhone(email?: string, phoneNumber?: string): Promise<Contact[]> {
    const contacts = await this.loadContacts();
    
    return contacts.filter(contact => 
      !contact.deletedAt && (
        (email && contact.email === email) ||
        (phoneNumber && contact.phoneNumber === phoneNumber)
      )
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async create(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const contacts = await this.loadContacts();
    const now = new Date();
    
    const newContact: Contact = {
      id: this.nextId++,
      phoneNumber: contact.phoneNumber,
      email: contact.email,
      linkedId: contact.linkedId,
      linkPrecedence: contact.linkPrecedence,
      createdAt: now,
      updatedAt: now,
      deletedAt: contact.deletedAt
    };
    
    contacts.push(newContact);
    await this.saveContacts(contacts);
    
    return newContact.id;
  }

  async findLinkedContacts(contactIds: number[]): Promise<Contact[]> {
    if (contactIds.length === 0) return [];
    
    const contacts = await this.loadContacts();
    
    return contacts.filter(contact => 
      !contact.deletedAt && (
        contactIds.includes(contact.id) ||
        (contact.linkedId && contactIds.includes(contact.linkedId))
      )
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async updateToSecondary(id: number, primaryId: number): Promise<void> {
    const contacts = await this.loadContacts();
    const contact = contacts.find(c => c.id === id);
    
    if (contact) {
      contact.linkPrecedence = 'secondary';
      contact.linkedId = primaryId;
      contact.updatedAt = new Date();
      await this.saveContacts(contacts);
    }
  }

  async updateLinkedContacts(oldPrimaryId: number, newPrimaryId: number): Promise<void> {
    const contacts = await this.loadContacts();
    
    contacts.forEach(contact => {
      if (contact.linkedId === oldPrimaryId) {
        contact.linkedId = newPrimaryId;
        contact.updatedAt = new Date();
      }
    });
    
    await this.saveContacts(contacts);
  }
}
