// src/services/batchWriter.js

/**
 * Batch Writer
 * Buffers Firestore writes and commits them in batches for performance
 */

import { db } from "../firebase";
import { writeBatch, collection, doc } from "firebase/firestore";

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 250; // 250ms buffer window

class BatchWriter {
  constructor() {
    this.queue = [];
    this.batchTimeout = null;
    this.processing = false;
  }

  /**
   * Add a write operation to the batch queue
   * @param {string} collectionName - Firestore collection name
   * @param {object} data - Document data
   * @param {string} docId - Optional document ID (auto-generated if not provided)
   * @returns {Promise<string>} Document ID
   */
  async addWrite(collectionName, data, docId = null) {
    return new Promise((resolve, reject) => {
      const writeOp = {
        collectionName,
        data,
        docId,
        resolve,
        reject,
        timestamp: Date.now(),
      };

      this.queue.push(writeOp);
      this.scheduleBatch();

      // Fallback timeout - if batch doesn't commit in 1 second, reject
      setTimeout(() => {
        if (this.queue.includes(writeOp)) {
          this.queue = this.queue.filter((op) => op !== writeOp);
          reject(new Error("Batch write timeout"));
        }
      }, 1000);
    });
  }

  /**
   * Schedule batch commit
   */
  scheduleBatch() {
    if (this.batchTimeout) {
      return; // Already scheduled
    }

    // If queue is full, commit immediately
    if (this.queue.length >= BATCH_SIZE) {
      this.commitBatch();
      return;
    }

    // Otherwise, schedule commit after delay
    this.batchTimeout = setTimeout(() => {
      this.commitBatch();
    }, BATCH_DELAY_MS);
  }

  /**
   * Commit batch to Firestore
   */
  async commitBatch() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    const batch = this.queue.splice(0, BATCH_SIZE);
    
    if (!db) {
      // Firestore not available - reject all
      batch.forEach((op) => op.reject(new Error("Firestore not available")));
      this.processing = false;
      return;
    }

    try {
      const firestoreBatch = writeBatch(db);

      const promises = batch.map((op) => {
        const docRef = op.docId
          ? doc(collection(db, op.collectionName), op.docId)
          : doc(collection(db, op.collectionName));
        
        firestoreBatch.set(docRef, op.data);
        
        return {
          op,
          docId: docRef.id,
        };
      });

      await firestoreBatch.commit();

      // Resolve all promises
      promises.forEach(({ op, docId }) => {
        op.resolve(docId);
      });
    } catch (err) {
      console.warn("Batch write failed, falling back to individual writes:", err.message);
      
      // Fallback: reject all and let caller handle individual writes
      batch.forEach((op) => {
        op.reject(err);
      });
    } finally {
      this.processing = false;
      
      // If more items in queue, schedule another batch
      if (this.queue.length > 0) {
        this.scheduleBatch();
      }
    }
  }

  /**
   * Flush all pending writes immediately
   */
  async flush() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    
    while (this.queue.length > 0) {
      await this.commitBatch();
    }
  }
}

// Singleton instance
const batchWriter = new BatchWriter();

/**
 * Add a write to the batch queue
 * @param {string} collectionName - Firestore collection name
 * @param {object} data - Document data
 * @param {string} docId - Optional document ID
 * @returns {Promise<string>} Document ID
 */
export async function addBatchWrite(collectionName, data, docId = null) {
  return batchWriter.addWrite(collectionName, data, docId);
}

/**
 * Flush all pending writes
 */
export async function flushBatch() {
  return batchWriter.flush();
}

