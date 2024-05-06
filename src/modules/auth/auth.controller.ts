import { Body, Controller, Headers, HttpCode, HttpStatus, Inject, Post, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { UserGuard } from "./guards/user.guard";

@ApiTags('auth')
@Controller('auth')
export class AuthController {

    constructor(
        @Inject('AUTH_SERVICE_TIENNT') private readonly authService: AuthService,
    ) { }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                token: {
                    type: 'string',
                    example: 'token'
                },
            },
        },
    })
    @Post('login/google')
    async loginFirebase(
        @Body() body: { token: string },
    ) {
        var token = body.token;
        return await this.authService.verifyFirebaseToken(token)
    }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: {
                    type: 'string',
                    example: 'email'
                },
                password: {
                    type: 'string',
                    example: 'password'
                },
            },
        },
    })
    @Post('login')
    async login(
        @Body() body: { email: string, password: string },
    ) {
        return await this.authService.loginWithPassword(body.email, body.password);
    }

    
    @ApiBearerAuth()
    @Post('verify-token-admin')
    async verifyTokenAdmin(
        @Headers() header: any,
    ) {
        var token = header?.authorization?.split(' ')[1];
        return await this.authService.verifyAdminToken(token);
    }

    @ApiBearerAuth()
    @Post('verify-token-staff')
    async verifyTokenStaff(
        @Headers() header: any,
    ) {
        var token = header?.authorization?.split(' ')[1];
        return await this.authService.verifyStaffToken(token);
    }

    @ApiBearerAuth()
    @Post('verify-token-dstaff')
    async verifyTokenDstaff(
        @Headers() header: any,
    ) {
        var token = header?.authorization?.split(' ')[1];
        return await this.authService.verifyDstaffToken(token);
    }
 
    @ApiBearerAuth()
    @UseGuards(UserGuard)
    @Post('verify-token-user')
    async verifyTokenUser() {
       return true;
    }

}