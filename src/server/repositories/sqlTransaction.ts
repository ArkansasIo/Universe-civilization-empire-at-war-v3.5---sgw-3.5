import type { SqlExecutor } from './mysqlRepository';

export interface SqlTransaction extends SqlExecutor {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export async function withSqlTransaction<T>(db: SqlTransaction, work: (tx: SqlTransaction) => Promise<T>): Promise<T> {
  await db.begin();
  try {
    const result = await work(db);
    await db.commit();
    return result;
  } catch (error) {
    try {
      await db.rollback();
    } catch {
      // Preserve the original application/database error.
    }
    throw error;
  }
}

export interface SqlWriteResult {
  affectedRows?: number;
  insertId?: number | string;
}
