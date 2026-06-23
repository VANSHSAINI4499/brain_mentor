import * as admin from 'firebase-admin';
import * as fs from 'fs/promises';
import * as path from 'path';

// TODO: Initialize Firebase Admin SDK for local testing when CLI is available.
// To run this script:
// 1. Ensure FIRESTORE_EMULATOR_HOST is set (e.g. export FIRESTORE_EMULATOR_HOST="127.0.0.1:8080")
// 2. Run using tsx or ts-node (e.g. npx tsx scripts/seed.ts)
// Note: This script is intended to be executed manually, not automatically during build.

const PROJECT_ID = 'demo-workshop-feedback';

function initialize() {
  if (admin.apps.length === 0) {
    admin.initializeApp({ projectId: PROJECT_ID });
  }
}

async function seedWorkshops() {
  const db = admin.firestore();
  const workshopsDir = path.join(__dirname, '../seed/workshops');
  
  try {
    const files = await fs.readdir(workshopsDir);
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const filePath = path.join(workshopsDir, file);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      const docId = data.id;
      // Convert JSON pseudo-timestamps to actual Firestore Timestamps
      if (data.dateTime && data.dateTime._seconds) {
        data.dateTime = new admin.firestore.Timestamp(data.dateTime._seconds, data.dateTime._nanoseconds || 0);
      }
      if (data.createdAt && data.createdAt._seconds) {
        data.createdAt = new admin.firestore.Timestamp(data.createdAt._seconds, data.createdAt._nanoseconds || 0);
      }
      if (data.updatedAt && data.updatedAt._seconds) {
        data.updatedAt = new admin.firestore.Timestamp(data.updatedAt._seconds, data.updatedAt._nanoseconds || 0);
      }
      
      await db.collection('workshops').doc(docId).set(data);
      console.log(`Seeded workshop: ${docId}`);
    }
  } catch (error) {
    console.error('Error seeding workshops:', error);
  }
}

async function run() {
  console.log('Starting seed...');
  initialize();
  await seedWorkshops();
  console.log('Seed complete.');
}

// Only execute if run directly
if (require.main === module) {
  run().catch(console.error);
}
