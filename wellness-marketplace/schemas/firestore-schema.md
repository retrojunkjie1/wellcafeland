# Firestore Schema for WellnessCafe and WellnessShift Marketplace

## Collections

### Users
- **Collection Name**: `users`
- **Document Structure**:
  - `id`: string (unique identifier for the user)
  - `name`: string (full name of the user)
  - `email`: string (email address of the user)
  - `createdAt`: timestamp (date and time when the user was created)
  - `updatedAt`: timestamp (date and time when the user was last updated)

### Wellness Cafes
- **Collection Name**: `wellnessCafes`
- **Document Structure**:
  - `id`: string (unique identifier for the wellness cafe)
  - `name`: string (name of the wellness cafe)
  - `location`: string (address or location of the wellness cafe)
  - `description`: string (description of the wellness cafe)
  - `createdAt`: timestamp (date and time when the cafe was created)
  - `updatedAt`: timestamp (date and time when the cafe was last updated)

### Wellness Shifts
- **Collection Name**: `wellnessShifts`
- **Document Structure**:
  - `id`: string (unique identifier for the wellness shift)
  - `cafeId`: string (reference to the wellness cafe's id)
  - `startTime`: timestamp (start time of the shift)
  - `endTime`: timestamp (end time of the shift)
  - `createdAt`: timestamp (date and time when the shift was created)
  - `updatedAt`: timestamp (date and time when the shift was last updated)

## Relationships
- Each `wellnessShift` document references a `wellnessCafe` document through the `cafeId` field.
- Each `wellnessCafe` can have multiple `wellnessShift` documents associated with it.
- Each `user` can interact with both `wellnessCafes` and `wellnessShifts`, but their specific roles and permissions will be defined in the Firestore security rules.