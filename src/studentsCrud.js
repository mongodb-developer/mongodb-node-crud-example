import { MongoClient } from 'mongodb';

export async function executeStudentCrudOperations() {
    const uri = process.env.DB_URI;
    let mongoClient;

    try {
        mongoClient = await connectToCluster(uri);
        const db = mongoClient.db('school');
        const collection = db.collection('students');

        console.log('CREATE Student');
        await createStudentDocument(collection);
        console.log(await findStudentsByName(collection, 'John Smith'));

        console.log('UPDATE Student\'s Birthdate');
        await updateStudentsByName(collection, 'John Smith', { birthdate: new Date(2001, 5, 5) });
        console.log(await findStudentsByName(collection, 'John Smith'));

        console.log('DELETE Student');
        await deleteStudentsByName(collection, 'John Smith');
        console.log(await findStudentsByName(collection, 'John Smith'));
    } finally {
        await mongoClient.close();
    }
}

export async function connectToCluster(uri) {
    let mongoClient;

    try {
        mongoClient = new MongoClient(uri);
        console.log('Connecting to MongoDB Atlas cluster...');
        await mongoClient.connect();
        console.log('Successfully connected to MongoDB Atlas!');

        return mongoClient;
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        process.exit();
    }
}

export async function createStudentDocument(collection) {
    const studentDocument = {
        name: 'John Smith',
        birthdate: new Date(2000, 11, 20),
        address: { street: 'Pike Lane', city: 'Los Angeles', state: 'CA' },
    };

    await collection.insertOne(studentDocument);
}

export async function findStudentsByName(collection, name) {
    return collection.find({ name }).toArray();
}

export async function updateStudentsByName(collection, name, updatedFields) {
    await collection.updateMany(
        { name },
        { $set: updatedFields }
    );
}

export async function deleteStudentsByName(collection, name) {
    await collection.deleteMany({ name });
}
