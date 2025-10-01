import { v4 as uuidv4 } from 'uuid';

export function generateUUID(): string {
  return uuidv4(); // Generates standard UUID v4 (e.g., "22a88471-122e-4780-8d63-cdb6ac74de1b")
}