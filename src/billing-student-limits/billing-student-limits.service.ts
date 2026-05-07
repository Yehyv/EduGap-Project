import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  ContractStatus,
  InstituteAnnualContract,
} from 'src/institute-annual-contracts/entities/institute-annual-contract.entity';

@Injectable()
export class BillingStudentLimitsService {
  constructor(
    @InjectRepository(InstituteAnnualContract)
    private readonly contractRepo: Repository<InstituteAnnualContract>,
    private readonly dataSource: DataSource,
  ) {}

  async getActiveContractOrFail(instituteId: number, academicYear?: number) {
    const year = academicYear ?? new Date().getFullYear();
    const contract = await this.contractRepo.findOne({
      where: {
        institute: { id: instituteId },
        academic_year: year,
        status: ContractStatus.ACTIVE,
      },
      relations: ['institute', 'plan'],
      order: { id: 'DESC' },
    });

    if (!contract) {
      throw new NotFoundException(
        `No active annual contract for institute ${instituteId} in ${year}`,
      );
    }

    return contract;
  }

  async getUsage(contractId: number) {
    const rows = await this.dataSource.query(
      `
      SELECT c.id AS contractId, c.max_students_allowed AS maxStudentsAllowed,
        COUNT(DISTINCT u.id) AS addedStudents
      FROM institute_annual_contracts c
      LEFT JOIN \`user\` u ON u.annual_contract_id = c.id
        AND u.deletedAt IS NULL AND u.is_active = 1
      WHERE c.id = ?
      GROUP BY c.id
      `,
      [contractId],
    );

    const row = rows[0];
    if (!row) throw new NotFoundException('Contract not found');

    const maxStudentsAllowed = Number(row.maxStudentsAllowed || 0);
    const addedStudents = Number(row.addedStudents || 0);

    return {
      contractId,
      maxStudentsAllowed,
      addedStudents,
      remainingStudents: Math.max(maxStudentsAllowed - addedStudents, 0),
    };
  }

  async assertCanAddStudents(
    instituteId: number,
    countToAdd = 1,
    academicYear?: number,
  ) {
    const contract = await this.getActiveContractOrFail(
      instituteId,
      academicYear,
    );
    const usage = await this.getUsage(contract.id);

    if (usage.remainingStudents < countToAdd) {
      throw new BadRequestException({
        message: 'Cannot add students. Annual contract student limit exceeded.',
        maxStudentsAllowed: usage.maxStudentsAllowed,
        addedStudents: usage.addedStudents,
        remainingStudents: usage.remainingStudents,
        requestedStudents: countToAdd,
      });
    }

    return { contract, usage };
  }
}
