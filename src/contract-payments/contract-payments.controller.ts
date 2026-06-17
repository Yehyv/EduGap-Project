import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CancelContractPaymentDto } from './dto/cancel-contract-payment.dto';
import { CreateContractPaymentDto } from './dto/create-contract-payment.dto';
import { FindContractPaymentsQueryDto } from './dto/find-contract-payments-query.dto';
import { ReverseContractPaymentDto } from './dto/reverse-contract-payment.dto';
import { UpdateContractPaymentDto } from './dto/update-contract-payment.dto';
import { ContractPaymentsService } from './contract-payments.service';
import { UploadInstitutePaymentProofDto } from './dto/upload-institute-payment-proof.dto';

const proofUploadPath = join(process.cwd(), 'uploads', 'payment-proofs');
interface UploadedPaymentProofFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
}
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    role?: string;
  };
}

const receiptUploadPath = './uploads/receipts';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ContractPaymentsController {
  constructor(private readonly service: ContractPaymentsService) {}

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('contract-payments')
  create(
    @Body() dto: CreateContractPaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.create(dto, req.user.sub);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('contract-payments')
  findAll(
    @Query() query: FindContractPaymentsQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.findAll(query, req.user);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('institute-annual-contracts/:contractId/payments')
  findByContract(
    @Param('contractId', ParseIntPipe) contractId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.findByContract(contractId, req.user);
  }
  @Roles('INST_ADMIN', 'INSTITUTE_ADMIN')
  @Post('contract-payments/institute/upload-proof')
  @UseInterceptors(
    FileInterceptor('receiptFile', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          if (!existsSync(proofUploadPath)) {
            mkdirSync(proofUploadPath, { recursive: true });
          }

          cb(null, proofUploadPath);
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `payment-proof-${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'application/pdf',
        ];

        if (!allowed.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Only JPG, PNG, JPEG and PDF payment proofs are allowed',
            ),
            false,
          );
        }

        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadInstitutePaymentProof(
    @Body() dto: UploadInstitutePaymentProofDto,
    @UploadedFile() file: UploadedPaymentProofFile,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('Payment proof file is required');
    }

    const receiptFile = `/uploads/payment-proofs/${file.filename}`;

    return this.service.uploadInstitutePaymentProof(dto, receiptFile, req.user);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('contract-payments/:id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.findOne(id, req.user);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('contract-payments/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContractPaymentDto,
  ) {
    return this.service.update(id, dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('contract-payments/:id/receipt')
  @UseInterceptors(
    FileInterceptor('receipt', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          if (!existsSync(receiptUploadPath)) {
            mkdirSync(receiptUploadPath, { recursive: true });
          }
          cb(null, receiptUploadPath);
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `receipt-${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'application/pdf',
        ];

        if (!allowed.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Only JPG, PNG, JPEG and PDF receipts are allowed',
            ),
            false,
          );
        }

        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadReceipt(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('Receipt file is required');
    }

    const receiptFile = `/uploads/receipts/${file.filename}`;

    return this.service.uploadReceipt(id, receiptFile, req.user);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('contract-payments/:id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.service.approve(id);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('contract-payments/:id/cancel')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelContractPaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.cancel(id, dto, req.user.sub);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('contract-payments/:id/reverse')
  reverse(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReverseContractPaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.reverse(id, dto, req.user.sub);
  }
}
