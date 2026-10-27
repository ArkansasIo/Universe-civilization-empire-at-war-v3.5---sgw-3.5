export interface SqlExecutor {
  execute<T = unknown>(sql: string, params?: readonly unknown[]): Promise<T>;
}

export interface MySqlRepositoryOptions {
  table: string;
  idColumn: string;
}

/** Generic SQL boundary. The application remains independent of mysql2/driver choice. */
export abstract class MySqlRepository<T extends { id: string }> {
  protected constructor(
    protected readonly db: SqlExecutor,
    private readonly options: MySqlRepositoryOptions,
  ) {}

  async deleteById(id: string): Promise<void> {
    validateIdentifier(this.options.table);
    validateIdentifier(this.options.idColumn);
    await this.db.execute(
      `DELETE FROM ${this.options.table} WHERE ${this.options.idColumn} = ?`,
      [id],
    );
  }
}

export function validateIdentifier(value: string): void {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) throw new Error('INVALID_SQL_IDENTIFIER');
}
