# Wellness Marketplace

Welcome to the Wellness Marketplace project! This repository contains the code and resources for the WellnessCafe and WellnessShift marketplace, which connects users with wellness cafes and their available shifts.

## Project Structure

The project is organized as follows:

- **firestore.rules**: Contains Firestore security rules that define access permissions for the database.
- **firestore.indexes.json**: Specifies the indexes for Firestore collections to optimize query performance.
- **firebase.json**: Configuration file for Firebase, specifying settings for hosting, functions, and Firestore.
- **.firebaserc**: Contains Firebase project configuration, including project aliases and settings for different environments.
- **schemas/**: 
  - **firestore-schema.md**: Documents the Firestore schema, outlining the structure and relationships of the data.
  - **wellness-schema.json**: Defines the JSON schema for the wellness marketplace, specifying data types and validation rules.
- **rules/**: 
  - **firestore.rules**: Contains Firestore security rules, specifying access control for the Firestore database.
- **functions/**: 
  - **package.json**: Configuration file for Firebase Cloud Functions, listing dependencies and scripts.
  - **tsconfig.json**: TypeScript configuration file for Firebase Cloud Functions.
  - **src/**: Contains the entry point for the Firebase Cloud Functions.
- **src/models/**: 
  - **user.ts**: Exports a class representing a user in the marketplace.
  - **wellnessCafe.ts**: Exports a class representing a wellness cafe.
  - **wellnessShift.ts**: Exports a class representing a wellness shift.
- **src/admin/**: 
  - **seed.ts**: Script to seed the Firestore database with initial data for testing and development.
- **tests/**: 
  - **firestore.rules.test.ts**: Tests for the Firestore security rules.
- **package.json**: Configuration file for npm, listing dependencies and scripts for the project.
- **tsconfig.json**: TypeScript configuration file for the project.

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd wellness-marketplace
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Firebase**:
   - Make sure you have the Firebase CLI installed.
   - Run `firebase login` to authenticate.
   - Run `firebase init` to set up your Firebase project.

4. **Deploy to Firebase**:
   ```bash
   firebase deploy
   ```

## Usage Guidelines

- Use the provided models to interact with the Firestore database.
- Follow the schema definitions in the `schemas` directory for data validation.
- Ensure that the Firestore security rules are tested and functioning as intended.

For more detailed information, refer to the individual files and documentation within the project. Happy coding!