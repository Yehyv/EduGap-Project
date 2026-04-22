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

    // Tables managed manually via logAction — subscriber must not double-log them
    const ignoredTables = new Set([
      'transactions',
      'http_requests',
      'institute_program_course',
      'institute_programs',
      'prerequiest_contents',
      'package_enrollments',
      'certificates',
      'certificate_content',
      'certificate_package',
      // Add any junction/pivot tables you log manually below:
      // 'program_instructors',
      // 'course_assignments',
    ]);

    if (ignoredTables.has(tableName)) {
      return;
    }

    const recordId = this.extractRecordId(event);
    const ctx = getRequestContext();

    const transactionRepo = event.manager.getRepository(Transaction);
    const systemUserRepo = event.manager.getRepository(SystemUser);

    const createdBy = ctx?.userId
      ? await systemUserRepo.findOne({
          where: { id: ctx.userId },
        })
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

  private normalizeNumericId(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (
      typeof value === 'string' &&
      value.trim() !== '' &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }

    return null;
  }

  private extractPrimaryColumnId(
    event: AuditEvent,
    source?: Record<string, unknown>,
  ): number | null {
    if (!source) {
      return null;
    }

    const primaryColumns = event.metadata.primaryColumns;

    if (primaryColumns.length !== 1) {
      return null;
    }

    const primaryColumnName = primaryColumns[0].propertyName;
    const value = source[primaryColumnName];

    return this.normalizeNumericId(value);
  }

  private extractRecordId(event: AuditEvent): number {
    const entity = this.getEventEntity(event);
    const databaseEntity = this.getEventDatabaseEntity(event);

    const directCandidates: unknown[] = [entity?.id, databaseEntity?.id];

    if ('entityId' in event) {
      directCandidates.push(event.entityId);
    }

    for (const candidate of directCandidates) {
      const parsed = this.normalizeNumericId(candidate);
      if (parsed !== null) {
        return parsed;
      }

      if (candidate && typeof candidate === 'object' && 'id' in candidate) {
        const nestedId = this.normalizeNumericId(
          (candidate as Record<string, unknown>).id,
        );

        if (nestedId !== null) {
          return nestedId;
        }
      }
    }

    const primaryFromEntity = this.extractPrimaryColumnId(event, entity);
    if (primaryFromEntity !== null) {
      return primaryFromEntity;
    }

    const primaryFromDatabaseEntity = this.extractPrimaryColumnId(
      event,
      databaseEntity,
    );
    if (primaryFromDatabaseEntity !== null) {
      return primaryFromDatabaseEntity;
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