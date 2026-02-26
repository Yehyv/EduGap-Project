import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UsersBatchUpload } from './entities/users-batch-upload.entity';
import { UsersBatchUploadError } from './entities/users_batch_upload_errors.entity';
import { User } from 'src/users/entities/user.entity';
import { SystemRole } from 'src/system-roles/entities/system-role.entity';
import * as bcrypt from 'bcrypt';
import { Workbook, Row } from 'exceljs';
import { Readable } from 'stream';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ExcelStudentRowDto } from './dto/excel-student-row.dto';
import * as ExcelJS from 'exceljs';
/* =========================
   Types
========================= */

interface ParsedExcelRow {
  rowNumber: number;
  full_name: string;
  email?: string;
  phone: string;
  national_id: string;
  student_id?: string;
}

interface BatchErrorInput {
  batchUpload: { id: number };
  rowNumber: number;
  errorType: string;
  errorMessage: string;
  rowData?: ParsedExcelRow;
}

interface ValidUserInput extends ParsedExcelRow {
  batchUpload: { id: number };
}

/* =========================
   Service
========================= */

@Injectable()
export class UsersBatchUploadService {
  constructor(
    @InjectRepository(UsersBatchUpload)
    private readonly batchRepo: Repository<UsersBatchUpload>,

    @InjectRepository(UsersBatchUploadError)
    private readonly errorRepo: Repository<UsersBatchUploadError>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(SystemRole)
    private readonly roleRepo: Repository<SystemRole>,
  ) {}

  downloadTemplate() {
    return { message: 'Excel template download' };
  }

  /* =========================
     Main Flow
  ========================= */

  async processUpload(
    file: Express.Multer.File,
    instituteId: number,
    systemUserId: number,
    programId?: number,
  ) {
    // 1️⃣ get student role once
    const studentRole = await this.roleRepo.findOne({
      where: { role_title: 'student' },
    });
    if (!studentRole) {
      throw new NotFoundException('Student role not found');
    }

    // 2️⃣ create batch
    const batch = await this.createBatch(file, systemUserId);

    // 3️⃣ parse excel
    const rows = await this.parseExcel(file);
    await this.updateTotalRows(batch, rows.length);

    // 4️⃣ file-level validation
    const { validUsers, errors: validationErrors } = await this.validateRows(
      rows,
      batch.id,
    );

    // 5️⃣ db-level duplicates
    const { finalUsers, errors: dbErrors } =
      await this.filterDatabaseDuplicates(validUsers, batch.id);

    // 6️⃣ build real User entities
    const usersToSave: User[] = [];
    for (const row of finalUsers) {
      usersToSave.push(
        await this.buildStudentEntity(
          row,
          instituteId,
          studentRole.id,
          batch.id,
          systemUserId,
          programId,
        ),
      );
    }

    // 7️⃣ save
    await this.userRepo.save(usersToSave);
    await this.saveErrors([...validationErrors, ...dbErrors]);

    // 8️⃣ finalize batch
    await this.finalizeBatch(
      batch,
      usersToSave.length,
      validationErrors.length + dbErrors.length,
    );

    // 9️⃣ build response
    const allErrors = [...validationErrors, ...dbErrors];

    return {
      ...this.buildResponse(batch, allErrors),

      // 👇 optional احترافي لو حابب
      rejectedFileUrl:
        allErrors.length > 0
          ? `/users-batch-upload/${batch.id}/rejected-excel`
          : null,
    };
  }
  private normalizeCellValue(value: unknown): string {
    if (value === null || value === undefined) return '';

    // لو Excel بعته number
    if (typeof value === 'number') {
      return Math.trunc(value).toString();
    }

    // أي حاجة تانية
    return String(value).trim();
  }

  /* =========================
     Batch helpers
  ========================= */

  private async createBatch(
    file: Express.Multer.File,
    systemUserId: number,
  ): Promise<UsersBatchUpload> {
    return this.batchRepo.save({
      createdBy: { id: systemUserId },
      originalFileName: file.originalname,
      status: 'PENDING',
    });
  }

  private async updateTotalRows(batch: UsersBatchUpload, total: number) {
    batch.totalRows = total;
    await this.batchRepo.save(batch);
  }

  /* =========================
     Excel Parsing (mock)
  ========================= */

  private async parseExcel(
    file: Express.Multer.File,
  ): Promise<ParsedExcelRow[]> {
    const workbook: Workbook = new Workbook();
    const rows: ParsedExcelRow[] = [];

    const stream = Readable.from(file.buffer);
    await workbook.xlsx.read(stream);

    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return rows;
    }

    sheet.eachRow((row: Row, rowNumber: number) => {
      if (rowNumber === 1) return;

      const fullName = this.extractCellText(row.getCell(1).value);
      const email = this.extractCellText(row.getCell(2).value);
      const phone = this.extractCellText(row.getCell(3).value);
      const nationalId = this.extractCellText(row.getCell(4).value);
      const studentId = this.extractCellText(row.getCell(5).value);

      rows.push({
        rowNumber,
        full_name: fullName ?? '',
        email,
        phone: phone ?? '',
        national_id: nationalId ?? '',
        student_id: studentId,
      });
    });

    return rows;
  }

  /* =========================
     Validation
  ========================= */
  private extractCellText(value: unknown): string | undefined {
    if (value === null || value === undefined) return undefined;

    // لو string
    if (typeof value === 'string') {
      const v = value.trim();
      return v === '' ? undefined : v;
    }

    // لو رقم
    if (typeof value === 'number') {
      return Math.trunc(value).toString();
    }

    // لو RichText
    if (typeof value === 'object') {
      // ExcelJS richText
      if ('richText' in value && Array.isArray((value as any).richText)) {
        const text = (value as any).richText
          .map((r: any) => r.text)
          .join('')
          .trim();
        return text || undefined;
      }

      // ExcelJS hyperlink
      if ('text' in value) {
        const text = String((value as any).text).trim();
        return text || undefined;
      }
    }

    return undefined;
  }

  private async validateRows(
    rows: ParsedExcelRow[],
    batchId: number,
  ): Promise<{ validUsers: ValidUserInput[]; errors: BatchErrorInput[] }> {
    const phoneSet = new Set<string>();
    const nationalSet = new Set<string>();
    const emailSet = new Set<string>();

    const validUsers: ValidUserInput[] = [];
    const errors: BatchErrorInput[] = [];

    for (const row of rows) {
      const dto = plainToInstance(ExcelStudentRowDto, row, {
        enableImplicitConversion: true,
        excludeExtraneousValues: false,
      });

      const dtoErrors = await validate(dto);

      if (dtoErrors.length > 0) {
        const firstError = dtoErrors[0];
        const errorMessage =
          Object.values(firstError.constraints || {})[0] || 'INVALID_FORMAT';

        errors.push({
          batchUpload: { id: batchId },
          rowNumber: row.rowNumber,
          errorType: 'INVALID_FORMAT',
          errorMessage,
          rowData: row, // 👈 مهم
        });
        continue;
      }

      // File-level duplicates
      if (phoneSet.has(row.phone)) {
        errors.push(this.buildError(batchId, row, 'DUPLICATE_PHONE'));
        continue;
      }

      if (nationalSet.has(row.national_id)) {
        errors.push(this.buildError(batchId, row, 'DUPLICATE_NATIONAL_ID'));
        continue;
      }

      if (row.email) {
        const normalizedEmail = row.email.toLowerCase();
        if (emailSet.has(normalizedEmail)) {
          errors.push(this.buildError(batchId, row, 'DUPLICATE_EMAIL'));
          continue;
        }
        emailSet.add(normalizedEmail);
      }

      phoneSet.add(row.phone);
      nationalSet.add(row.national_id);

      validUsers.push({
        ...row,
        batchUpload: { id: batchId },
      });
    }

    return { validUsers, errors };
  }

  private async filterDatabaseDuplicates(
    users: ValidUserInput[],
    batchId: number,
  ) {
    const phones = users.map((u) => u.phone);
    const nids = users.map((u) => u.national_id);
    const emails = users
      .filter((u) => u.email)
      .map((u) => u.email!.toLowerCase());

    const existing = await this.userRepo.find({
      where: [
        { phone: In(phones) },
        { national_id: In(nids) },
        ...(emails.length ? [{ email: In(emails) }] : []),
      ],
    });

    const existingPhones = new Set(existing.map((u) => u.phone));
    const existingNids = new Set(existing.map((u) => u.national_id));
    const existingEmails = new Set(
      existing.filter((u) => u.email).map((u) => u.email!.toLowerCase()),
    );

    const finalUsers: ValidUserInput[] = [];
    const errors: BatchErrorInput[] = [];

    for (const user of users) {
      if (
        existingPhones.has(user.phone) ||
        existingNids.has(user.national_id) ||
        (user.email && existingEmails.has(user.email.toLowerCase()))
      ) {
        errors.push(this.buildError(batchId, user, 'DUPLICATE_IN_DATABASE'));
        continue;
      }

      finalUsers.push(user);
    }

    return { finalUsers, errors };
  }

  /* =========================
     Build Student (IMPORTANT)
  ========================= */

  private async buildStudentEntity(
    row: ParsedExcelRow,
    instituteId: number,
    roleId: number,
    batchId: number,
    systemUserId: number,
    programId?: number,
  ): Promise<User> {
    const baseUrl = process.env.APP_URL || '';
    const profileImage = `${baseUrl}/uploads/defaults/default-user.png`;

    return this.userRepo.create({
      full_name: row.full_name,
      email: row.email,
      phone: row.phone,
      national_id: row.national_id,
      studentId: row.student_id ? Number(row.student_id) : undefined,

      username: row.national_id,
      password: await bcrypt.hash(row.phone, 10),

      institute: { id: instituteId },
      UserRole: { id: roleId },

      is_active: 1,
      is_verified: 0,
      added_type: 1,
      user_image: profileImage,
      phone_key: '20',
      program: programId ? { id: programId } : undefined,
      batchUpload: { id: batchId },
      createdBy: { id: systemUserId },
    });
  }

  /* =========================
     Persistence helpers
  ========================= */

  private async saveErrors(errors: BatchErrorInput[]) {
    if (errors.length) {
      await this.errorRepo.save(errors);
    }
  }

  private async finalizeBatch(
    batch: UsersBatchUpload,
    inserted: number,
    ignored: number,
  ) {
    batch.insertedRows = inserted;
    batch.ignoredRows = ignored;
    batch.status =
      inserted === 0 ? 'FAILED' : ignored > 0 ? 'PARTIAL' : 'SUCCESS';

    await this.batchRepo.save(batch);
  }

  /* =========================
     Response
  ========================= */

  private buildResponse(batch: UsersBatchUpload, errors: BatchErrorInput[]) {
    return {
      batchId: batch.id,
      totalRows: batch.totalRows,
      inserted: batch.insertedRows,
      ignored: batch.ignoredRows,
      errors: errors.map((e) => ({
        row: e.rowNumber,
        error: e.errorType,
        message: e.errorMessage,
        data: e.rowData
          ? {
              full_name: e.rowData.full_name,
              email: e.rowData.email,
              phone: e.rowData.phone,
              national_id: e.rowData.national_id,
              student_id: e.rowData.student_id,
            }
          : null,
      })),
    };
  }
  private async generateRejectedExcel(
    errors: BatchErrorInput[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Rejected Rows');

    sheet.addRow(['full_name', 'email', 'phone', 'national_id', 'student_id']);

    errors.forEach((e) => {
      if (!e.rowData) return;

      sheet.addRow([
        e.rowData.full_name,
        e.rowData.email,
        e.rowData.phone,
        e.rowData.national_id,
        e.rowData.student_id,
      ]);
    });

    const uint8Array = await workbook.xlsx.writeBuffer(); // Uint8Array
    return Buffer.from(uint8Array); // 👈 الحل
  }
  async downloadRejectedExcel(batchId: number): Promise<Buffer> {
    const batch = await this.batchRepo.findOne({
      where: { id: batchId },
      relations: ['errors'],
    });

    if (!batch) {
      throw new NotFoundException(`Batch ${batchId} not found`);
    }

    if (!batch.errors?.length) {
      throw new NotFoundException('No rejected rows found for this batch');
    }

    return this.generateRejectedExcel(batch.errors);
  }

  private buildError(
    batchId: number,
    row: ParsedExcelRow,
    type: string,
  ): BatchErrorInput {
    return {
      batchUpload: { id: batchId },
      rowNumber: row.rowNumber,
      errorType: type,
      errorMessage: type.replace(/_/g, ' '),
      rowData: row,
    };
  }
  async getBatchDetails(batchId: number) {
    const batch = await this.batchRepo.findOne({
      where: { id: batchId },
      relations: ['errors', 'createdBy'],
    });

    if (!batch) {
      throw new NotFoundException(`Batch with id ${batchId} not found`);
    }

    return batch;
  }
}
