export class WellnessCafe {
    id: string;
    name: string;
    location: string;
    description: string;
    contactInfo: {
        phone: string;
        email: string;
    };
    services: string[];
    createdAt: Date;
    updatedAt: Date;

    constructor(id: string, name: string, location: string, description: string, contactInfo: { phone: string; email: string }, services: string[]) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.description = description;
        this.contactInfo = contactInfo;
        this.services = services;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    updateDetails(name: string, location: string, description: string, contactInfo: { phone: string; email: string }, services: string[]) {
        this.name = name;
        this.location = location;
        this.description = description;
        this.contactInfo = contactInfo;
        this.services = services;
        this.updatedAt = new Date();
    }
}