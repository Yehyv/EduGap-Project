import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { getRequestContext } from 'src/common/context/request-context.service';

type LogActionInput = {
  tableName: string;
  type: TransactionType;
  recordId?: number;
  payload?: unknown;
  createdById?: number;
};

type LogHttpRequestInput = {
  type: TransactionType.REQUEST_SUCCESS | TransactionType.REQUEST_ERROR;
  statusCode: number;
  errorMessage?: string | null;
};

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(SystemUser)
    private readonly systemUserRepo: Repository<SystemUser>,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    return this.transactionRepo.save(createTransactionDto as Transaction);
  }

  async findAll() {
    return this.transactionRepo.find({
      relations: ['createdBy'],
      order: { created_at: 'DESC' },
      take: 100,
    });
  }

  async findOne(id: number) {
    const row = await this.transactionRepo.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!row) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }

    return row;
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    const row = await this.findOne(id);
    Object.assign(row, updateTransactionDto);
    return this.transactionRepo.save(row);
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    await this.transactionRepo.remove(row);
    return { message: 'Transaction removed successfully', id };
  }

  async logAction({
    tableName,
    type,
    recordId = 0,
    payload,
    createdById,
  }: LogActionInput): Promise<void> {
    if (tableName === 'transactions') {
      return;
    }

    const userId = createdById ?? getRequestContext()?.userId;
    const createdBy = userId
      ? await this.systemUserRepo.findOne({ where: { id: userId } })
      : null;

    const trx = this.transactionRepo.create({
      table_name: tableName,
      trans_type: type,
      record_id: recordId,
      json_file: this.safeStringify(payload),
      createdBy: createdBy ?? null,
    });

    await this.transactionRepo.save(trx);
  }

  async logHttpRequest({
    type,
    statusCode,
    errorMessage,
  }: LogHttpRequestInput): Promise<void> {
    const ctx = getRequestContext();

    await this.logAction({
      tableName: 'http_requests',
      type,
      recordId: 0,
      payload: {
        statusCode,
        errorMessage: errorMessage ?? null,
        request: ctx ?? null,
      },
      createdById: ctx?.userId,
    });
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
        value: String(value),
      });
    }
  }
}
