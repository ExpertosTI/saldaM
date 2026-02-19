import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Res,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SplitSheetService } from './split-sheet.service';
import { CollaboratorRole } from './entities/collaborator.entity';

type JwtUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  ipAddress?: string;
  userAgent?: string;
};

type RequestWithUser = {
  user: JwtUser;
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
  socket: { remoteAddress?: string };
};

type ResponseWithFile = {
  set: (headers: Record<string, string | number>) => void;
  end: (buffer: Buffer) => void;
};

type CreateSplitSheetBody = {
  title: string;
  label?: string | null;
  studio?: string | null;
  producerName?: string | null;
  collaborators?: Array<{
    email: string;
    legalName: string;
    role: CollaboratorRole;
    percentage: number;
  }>;
};

@Controller('split-sheets')
export class SplitSheetController {
  constructor(private readonly splitSheetService: SplitSheetService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body() createSplitSheetDto: CreateSplitSheetBody,
    @Req() req: RequestWithUser,
  ) {
    return this.splitSheetService.create(createSplitSheetDto, req.user);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Req() req: RequestWithUser) {
    return this.splitSheetService.findAllByUser(req.user.id, req.user.email);
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  getStats(@Req() req: RequestWithUser) {
    return this.splitSheetService.getStats(req.user);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: RequestWithUser,
  ) {
    return this.splitSheetService.findOne(id, req.user);
  }

  @Get(':id/pdf')
  @UseGuards(AuthGuard('jwt'))
  async downloadPdf(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: RequestWithUser,
    @Res() res: ResponseWithFile,
  ) {
    const user = req.user;
    const pdfBuffer = await this.splitSheetService.downloadPdf(id, user); // Pass user for auth check
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="split-sheet-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Get(':id/full-pdf')
  @UseGuards(AuthGuard('jwt'))
  async downloadFullPdf(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: RequestWithUser,
    @Res() res: ResponseWithFile,
  ) {
    const user = req.user;
    const pdfBuffer = await this.splitSheetService.downloadFullPdf(id, user);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="full-split-sheet-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
  @Post(':id/invite')
  @UseGuards(AuthGuard('jwt'))
  async generateInvite(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: RequestWithUser,
  ) {
    const token = await this.splitSheetService.generateInvite(id, req.user);
    return { token, url: `https://app.saldanamusic.com/join/${token}` };
  }

  @Post('join/:token')
  @UseGuards(AuthGuard('jwt'))
  async joinViaInvite(
    @Param('token') token: string,
    @Req() req: RequestWithUser,
  ) {
    return this.splitSheetService.joinViaInvite(token, req.user);
  }

  @Post(':id/start-signatures')
  @UseGuards(AuthGuard('jwt'))
  async startSignatures(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: RequestWithUser,
  ) {
    return this.splitSheetService.startSignatures(id, req.user);
  }

  @Post(':id/sign/otp')
  @UseGuards(AuthGuard('jwt'))
  async requestOtp(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: RequestWithUser,
  ) {
    return this.splitSheetService.requestSignatureOtp(id, req.user);
  }

  @Post(':id/sign')
  @UseGuards(AuthGuard('jwt'))
  async sign(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: RequestWithUser,
    @Body() body: { signature: string; otpCode: string },
  ) {
    // Capture IP and User Agent
    const forwardedFor = req.headers['x-forwarded-for'];
    const forwardedForValue = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor;
    req.user.ipAddress =
      req.ip || forwardedForValue || req.socket.remoteAddress || undefined;

    const userAgent = req.headers['user-agent'];
    req.user.userAgent = Array.isArray(userAgent) ? userAgent[0] : userAgent;
    return this.splitSheetService.sign(
      id,
      req.user,
      body.signature,
      body.otpCode,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteSplitSheet(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: RequestWithUser,
  ) {
    return this.splitSheetService.deleteSplitSheet(id, req.user);
  }

  @Post(':id/collaborator')
  @UseGuards(AuthGuard('jwt'))
  async addCollaborator(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: RequestWithUser,
    @Body()
    body: {
      email: string;
      legalName: string;
      role: CollaboratorRole;
      percentage: number;
    },
  ) {
    return this.splitSheetService.addCollaborator(id, req.user, body);
  }

  @Delete(':id/collaborator/:email')
  @UseGuards(AuthGuard('jwt'))
  async removeCollaborator(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('email') email: string,
    @Req() req: RequestWithUser,
  ) {
    return this.splitSheetService.removeCollaborator(id, req.user, email);
  }

  @Post(':id/request-sign-otp')
  @UseGuards(AuthGuard('jwt'))
  async requestSignOtp(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: RequestWithUser,
  ) {
    return this.splitSheetService.requestSignOtp(id, req.user);
  }

  @Post(':id/verify-sign-otp')
  @UseGuards(AuthGuard('jwt'))
  async verifySignOtp(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: RequestWithUser,
    @Body() body: { otp: string },
  ) {
    return this.splitSheetService.verifySignOtp(id, req.user, body.otp);
  }

  @Post(':id/upload-id')
  @UseGuards(AuthGuard('jwt'))
  async uploadIdentityDoc(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: RequestWithUser,
    @Body() body: { document: string; documentType: string },
  ) {
    return this.splitSheetService.uploadIdentityDoc(
      id,
      req.user,
      body.document,
      body.documentType,
    );
  }
}
