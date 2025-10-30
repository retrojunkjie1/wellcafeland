import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import * as firebase from 'firebase-admin';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

const projectId = 'wellness-marketplace-test';
const rules = 'rules/firestore.rules';

describe('Firestore Security Rules', () => {
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId,
      firestore: {
        rules,
      },
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it('should allow read access to public collections', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const docRef = db.collection('publicCollection').doc('docId');
    await assertSucceeds(docRef.get());
  });

  it('should deny write access to public collections for unauthenticated users', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const docRef = db.collection('publicCollection').doc('docId');
    await assertFails(docRef.set({ data: 'test' }));
  });

  it('should allow authenticated users to write to their own documents', async () => {
    const userId = 'user123';
    const db = testEnv.authenticatedContext(userId).firestore();
    const docRef = db.collection('users').doc(userId);
    await assertSucceeds(docRef.set({ name: 'Test User' }));
  });

  it('should deny authenticated users from writing to others\' documents', async () => {
    const userId = 'user123';
    const otherUserId = 'user456';
    const db = testEnv.authenticatedContext(userId).firestore();
    const docRef = db.collection('users').doc(otherUserId);
    await assertFails(docRef.set({ name: 'Test User' }));
  });
});