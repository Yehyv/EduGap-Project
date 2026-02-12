import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  ObjectLiteral,
} from 'typeorm';
import { DataSource } from 'typeorm';
import {
  Transaction,
  TransactionType,
} from 'src/transactions/entities/transaction.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { asyncLocalStorage } from '../context/request-context.service';

@EventSubscriber()
export class AuditSubscriber
  implements EntitySubscriberInterface<ObjectLiteral>
{
  constructor(private readonly dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  async afterInsert(event: InsertEvent<ObjectLiteral>) {
    await this.handleEvent(event, TransactionType.CREATE);
  }

  async afterUpdate(event: UpdateEvent<ObjectLiteral>) {
    await this.handleEvent(event, TransactionType.UPDATE);
  }

  async afterRemove(event: RemoveEvent<ObjectLiteral>) {
    await this.handleEvent(event, TransactionType.DELETE);
  }

  private async handleEvent(
    event:
      | InsertEvent<ObjectLiteral>
      | UpdateEvent<ObjectLiteral>
      | RemoveEvent<ObjectLiteral>,
    type: TransactionType,
  ) {
    // منع تسجيل العمليات على جدول transactions نفسه
    if (event.metadata.tableName === 'transactions') return;

    // استخراج entity بطريقة آمنة
    const entity =
      event.entity ??
      ('databaseEntity' in event ? event.databaseEntity : undefined);

    if (!entity || typeof entity !== 'object') return;

    const recordId =
      'id' in entity && typeof entity.id === 'number' ? entity.id : undefined;

    if (!recordId) return;

    // 🟢 استخراج userId من AsyncLocalStorage
    const store = asyncLocalStorage.getStore();
    console.log('STORE:', store);
    const userId = store?.userId;

    let createdByUser: SystemUser | null = null;

    if (userId) {
      createdByUser = await event.manager
        .getRepository(SystemUser)
        .findOne({ where: { id: userId } });
    }

    // 🟢 تجهيز json حسب نوع العملية
    let payload: unknown = entity;

    if (type === TransactionType.UPDATE && 'databaseEntity' in event) {
      payload = {
        old: event.databaseEntity,
        new: event.entity,
      };
    }

    const transactionRepo = event.manager.getRepository(Transaction);

    await transactionRepo.save({
      table_name: event.metadata.tableName,
      trans_type: type,
      record_id: recordId,
      json_file: JSON.stringify(payload),
      createdBy: createdByUser ?? undefined,
    });
  }
}
