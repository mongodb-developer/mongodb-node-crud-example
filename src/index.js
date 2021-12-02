import { config } from 'dotenv';
import { executeStudentCrudOperations } from './studentsCrud.js';

config();
await executeStudentCrudOperations();
