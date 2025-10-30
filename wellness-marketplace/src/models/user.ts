class User {
    id: string;
    name: string;
    email: string;

    constructor(id: string, name: string, email: string) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    getUserInfo() {
        return {
            id: this.id,
            name: this.name,
            email: this.email
        };
    }

    updateEmail(newEmail: string) {
        this.email = newEmail;
    }
}