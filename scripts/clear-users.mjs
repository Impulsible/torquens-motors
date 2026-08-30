import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Helper to extract MONGODB_URI directly without external libraries
function getMongoUri() {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const match = content.match(/^MONGODB_URI=(.*)$/m);
      if (match && match[1]) {
        return match[1].trim().replace(/^["']|["']$/g, '');
      }
    }
  }
  return null;
}

async function clearUsers() {
  const uri = getMongoUri();

  if (!uri) {
    console.error('❌ Could not find MONGODB_URI in process.env, .env.local, or .env');
    process.exit(1);
  }

  try {
    console.log('🔄 Connecting to MongoDB database...');
    await mongoose.connect(uri);
    console.log('✅ Connected.');

    // Remove all users from the collection
    const result = await mongoose.connection.collection('users').deleteMany({});

    console.log('\n======================================================');
    console.log(`🗑️  SUCCESS: Removed ${result.deletedCount} user(s) from the database.`);
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Error deleting users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  }
}

clearUsers();