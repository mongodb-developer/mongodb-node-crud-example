import { config } from 'dotenv';
import { jest } from '@jest/globals';
import {
    connectToCluster,
    createStudentDocument,
    findStudentsByName,
    updateStudentsByName,
    deleteStudentsByName,
    executeStudentCrudOperations
} from "./studentsCrud.js";

config();
const uri = process.env.DB_URI;

describe('CRUD', () => {
    let mongoClient;
    let collection;

    beforeAll(async () => {
        mongoClient = await connectToCluster(uri);
        collection = mongoClient.db('school').collection('students');
    });

    afterEach(async () => {
        await collection.deleteMany({});
    });

    afterAll(async () => {
        await mongoClient.close();
    });

    test('Create', async () => {
        await createStudentDocument(collection);
        const documents = await collection.find().toArray();
        expect(documents.length).toBe(1);
        expect(documents[0].name).toEqual('John Smith');
    });

    test('Update', async () => {
        await collection.insertOne({
            name: 'Jeremy Renner',
        });

        const documents = await findStudentsByName(collection, 'Jeremy Renner');
        expect(documents.length).toBe(1);
        expect(documents[0].name).toEqual('Jeremy Renner');

        await updateStudentsByName(collection, 'Jeremy Renner', { name: 'Hailee Steinfeld' });
        const documentsAfterUpdate = await collection.find().toArray();

        expect(documentsAfterUpdate.length).toBe(1);
        expect(documentsAfterUpdate[0].name).toEqual('Hailee Steinfeld');
    });

    test('Read', async () => {
        await collection.insertOne({
            name: 'Jeremy Renner',
        });

        const documents = await findStudentsByName(collection, 'Jeremy Renner');
        expect(documents.length).toBe(1);
        expect(documents[0].name).toEqual('Jeremy Renner');
    });

    test('Delete', async () => {
        await collection.insertOne({
            name: 'Jeremy Renner',
        });

        const documents = await findStudentsByName(collection, 'Jeremy Renner');
        expect(documents.length).toBe(1);
        expect(documents[0].name).toEqual('Jeremy Renner');

        await deleteStudentsByName(collection, 'Jeremy Renner');
        const documentsAfterDelete = await findStudentsByName(collection, 'Jeremy Renner');
        expect(documentsAfterDelete.length).toBe(0);
    });
});

describe('Students CRUD E2E', () => {
    test('Execute students CRUD Operations', async () => {
        const consoleLogMock = jest.spyOn(console, 'log');
        await executeStudentCrudOperations();

        expect(consoleLogMock).toHaveBeenCalledTimes(8);
        expect(consoleLogMock).toHaveBeenCalledWith('Successfully connected to MongoDB Atlas!');

        expect(consoleLogMock).toHaveBeenCalledWith('CREATE Student');

        expect(consoleLogMock).toHaveBeenCalledWith('UPDATE Student\'s Birthdate');

        expect(consoleLogMock).toHaveBeenCalledWith('DELETE Student');

        const mongoClient = await connectToCluster(uri);
        const db = mongoClient.db('school');
        const collection = db.collection('students');
        const documentsAfterOperation = await collection.find().toArray();
        expect(documentsAfterOperation.length).toBe(0);
        await mongoClient.close();

        consoleLogMock.mockRestore();
    });

    test('Invalid Cluster URI', async () => {
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
        const exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {});

        const mongoClient = await connectToCluster('invalid-uri');
        expect(mongoClient).toBe(undefined);

        expect(consoleErrorMock).toHaveBeenCalledTimes(1);
        expect(consoleErrorMock.mock.calls[0].includes('Connection to MongoDB Atlas failed!'));
        expect(exitMock).toHaveBeenCalledTimes(1);

        consoleErrorMock.mockRestore();
        exitMock.mockRestore();
    });
});
