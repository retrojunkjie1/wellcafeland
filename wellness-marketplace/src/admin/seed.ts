import { Firestore } from '@google-cloud/firestore';

const firestore = new Firestore();

async function seedDatabase() {
    const wellnessCafes = [
        {
            id: 'cafe1',
            name: 'Healthy Bites',
            location: '123 Wellness St, Health City',
            description: 'A cafe offering healthy meals and snacks.',
            contact: 'contact@healthybites.com',
        },
        {
            id: 'cafe2',
            name: 'Green Leaf Cafe',
            location: '456 Green Ave, Nature Town',
            description: 'A cafe focused on organic and vegan options.',
            contact: 'info@greenleafcafe.com',
        },
    ];

    const wellnessShifts = [
        {
            id: 'shift1',
            cafeId: 'cafe1',
            startTime: '2023-10-01T08:00:00Z',
            endTime: '2023-10-01T16:00:00Z',
        },
        {
            id: 'shift2',
            cafeId: 'cafe2',
            startTime: '2023-10-01T09:00:00Z',
            endTime: '2023-10-01T17:00:00Z',
        },
    ];

    const batch = firestore.batch();

    wellnessCafes.forEach(cafe => {
        const cafeRef = firestore.collection('wellnessCafes').doc(cafe.id);
        batch.set(cafeRef, cafe);
    });

    wellnessShifts.forEach(shift => {
        const shiftRef = firestore.collection('wellnessShifts').doc(shift.id);
        batch.set(shiftRef, shift);
    });

    await batch.commit();
    console.log('Database seeded successfully');
}

seedDatabase().catch(console.error);