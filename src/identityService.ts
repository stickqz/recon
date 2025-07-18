import { ContactRepository } from './contactRepository';
import { Contact, IdentifyRequest, IdentifyResponse } from './types';

export class IdentityService {
  private contactRepo: ContactRepository;

  constructor() {
    this.contactRepo = new ContactRepository();
  }

  async identify(request: IdentifyRequest): Promise<IdentifyResponse> {
    const { email, phoneNumber } = request;

    if (!email && !phoneNumber) {
      throw new Error('Either email or phoneNumber must be provided');
    }

    // Find existing contacts
    const existingContacts = await this.contactRepo.findByEmailOrPhone(email, phoneNumber);

    if (existingContacts.length === 0) {
      // No existing contact found, create a new primary contact
      const newContactId = await this.contactRepo.create({
        email,
        phoneNumber,
        linkPrecedence: 'primary',
      });

      return {
        contact: {
          primaryContactId: newContactId,
          emails: email ? [email] : [],
          phoneNumbers: phoneNumber ? [phoneNumber] : [],
          secondaryContactIds: [],
        },
      };
    }

    // Get all linked contacts
    const allContactIds = existingContacts.map(c => c.id);
    const linkedContacts = await this.contactRepo.findLinkedContacts(allContactIds);

    // Find the primary contact (oldest one)
    const primaryContact = this.findPrimaryContact(linkedContacts);

    // Check if we need to create a new secondary contact
    const needNewContact = this.shouldCreateNewContact(linkedContacts, email, phoneNumber);

    if (needNewContact) {
      // Create new secondary contact
      await this.contactRepo.create({
        email,
        phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary',
      });

      // Refresh linked contacts
      const refreshedContacts = await this.contactRepo.findLinkedContacts([primaryContact.id]);
      return this.buildResponse(refreshedContacts);
    }

    // Handle potential consolidation of primary contacts
    await this.handlePrimaryConsolidation(linkedContacts);

    // Get final state of contacts
    const finalContacts = await this.contactRepo.findLinkedContacts([primaryContact.id]);
    return this.buildResponse(finalContacts);
  }

  private findPrimaryContact(contacts: Contact[]): Contact {
    // Find the oldest contact (first created)
    const sortedContacts = contacts.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    return sortedContacts[0];
  }

  private shouldCreateNewContact(contacts: Contact[], email?: string, phoneNumber?: string): boolean {
    const existingEmails = new Set(contacts.map(c => c.email).filter(Boolean));
    const existingPhones = new Set(contacts.map(c => c.phoneNumber).filter(Boolean));

    const hasNewEmail = email && !existingEmails.has(email);
    const hasNewPhone = phoneNumber && !existingPhones.has(phoneNumber);

    return Boolean(hasNewEmail || hasNewPhone);
  }

  private async handlePrimaryConsolidation(contacts: Contact[]): Promise<void> {
    const primaryContacts = contacts.filter(c => c.linkPrecedence === 'primary');
    
    if (primaryContacts.length <= 1) {
      return; // No consolidation needed
    }

    // Sort by creation date to find the oldest
    const sortedPrimaries = primaryContacts.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const truePrimary = sortedPrimaries[0];
    const contactsToConvert = sortedPrimaries.slice(1);

    // Convert other primaries to secondaries
    for (const contact of contactsToConvert) {
      await this.contactRepo.updateToSecondary(contact.id, truePrimary.id);
      // Update any contacts that were linked to this old primary
      await this.contactRepo.updateLinkedContacts(contact.id, truePrimary.id);
    }
  }

  private buildResponse(contacts: Contact[]): IdentifyResponse {
    const primaryContact = contacts.find(c => c.linkPrecedence === 'primary')!;
    const secondaryContacts = contacts.filter(c => c.linkPrecedence === 'secondary');

    const emails = Array.from(new Set(
      contacts.map(c => c.email).filter((email): email is string => Boolean(email))
    )).sort();

    const phoneNumbers = Array.from(new Set(
      contacts.map(c => c.phoneNumber).filter((phone): phone is string => Boolean(phone))
    )).sort();

    const secondaryContactIds = secondaryContacts
      .map(c => c.id)
      .sort((a, b) => a - b);

    return {
      contact: {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    };
  }
}
