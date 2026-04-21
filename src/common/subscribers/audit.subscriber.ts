import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  SoftRemoveEvent,
  RecoverEvent,
  ObjectLiteral,
  DataSource,
} from 'typeorm';
import {
  Transaction,
  TransactionType,
} from 'src/transactions/entities/transaction.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { getRequestContext } from '../context/request-context.service';

type AuditEvent =
  | InsertEvent<ObjectLiteral>
  | UpdateEvent<ObjectLiteral>
  | RemoveEvent<ObjectLiteral>
  | SoftRemoveEvent<ObjectLiteral>
  | RecoverEvent<ObjectLiteral>;

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(private readonly dataSource: DataSource) {
    this.dataSource.subscribers.push(this);
  }

  async afterInsert(event: InsertEvent<ObjectLiteral>): Promise<void> {
    await this.handleEvent(event, TransactionType.CREATE, event.entity);
  }

  async afterUpdate(event: UpdateEvent<ObjectLiteral>): Promise<void> {
    await this.handleEvent(event, TransactionType.UPDATE, {
      before: event.databaseEntity ?? null,
      after: event.entity ?? null,
      updatedColumns: event.updatedColumns.map((column) => column.propertyName),
    });
  }

  async afterRemove(event: RemoveEvent<ObjectLiteral>): Promise<void> {
    await this.handleEvent(
      event,
      TransactionType.DELETE,
      event.databaseEntity ?? event.entity,
    );
  }

  async afterSoftRemove(event: SoftRemoveEvent<ObjectLiteral>): Promise<void> {
    await this.handleEvent(
      event,
      TransactionType.SOFT_DELETE,
      event.databaseEntity ?? event.entity,
    );
  }

  async afterRecover(event: RecoverEvent<ObjectLiteral>): Promise<void> {
    await this.handleEvent(
      event,
      TransactionType.RESTORE,
      event.entity ?? event.databaseEntity,
    );
  }

  private async handleEvent(
    event: AuditEvent,
    type: TransactionType,
    payload: unknown,
  ): Promise<void> {
    const tableName = event.metadata.tableName;

    if (tableName === 'transactions') {
      return;
    }

    const recordId = this.extractRecordId(event);
    const ctx = getRequestContext();

    const transactionRepo = event.manager.getRepository(Transaction);
    const systemUserRepo = event.manager.getRepository(SystemUser);

    const createdBy = ctx?.userId
      ? await systemUserRepo.findOne({ where: { id: ctx.userId } })
      : null;

    const row = transactionRepo.create({
      table_name: tableName,
      trans_type: type,
      record_id: recordId,
      json_file: this.safeStringify({
        request: ctx ?? null,
        payload,
      }),
      createdBy: createdBy ?? null,
    });

    await transactionRepo.save(row);
  }

  private getEventEntity(
    event: AuditEvent,
  ): Record<string, unknown> | undefined {
    return event.entity as Record<string, unknown> | undefined;
  }

  private getEventDatabaseEntity(
    event: AuditEvent,
  ): Record<string, unknown> | undefined {
    if ('databaseEntity' in event) {
      return event.databaseEntity as Record<string, unknown> | undefined;
    }

    return undefined;
  }

  private extractRecordId(event: AuditEvent): number {
    const entity =
      this.getEventEntity(event) ?? this.getEventDatabaseEntity(event);

    const rawId = entity?.id;

    if (typeof rawId === 'number') {
      return rawId;
    }

    if (
      typeof rawId === 'string' &&
      rawId.trim() !== '' &&
      !Number.isNaN(Number(rawId))
    ) {
      return Number(rawId);
    }

    return 0;
  }

  private safeStringify(value: unknown): string | null {
    if (value === undefined) {
      return null;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return JSON.stringify({
        serializationError: true,
        valueType: typeof value,
        objectTag: Object.prototype.toString.call(value),
      });
    }
  }
}
