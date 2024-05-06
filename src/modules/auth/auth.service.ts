import { HttpException, Inject, Injectable } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import admin from "../../config/firebase.credential";
import { AccountService } from "../account/account.service";
import { ProfileService } from "../account/profile/profile.service";

@Injectable()
export class AuthService {

    constructor(
        private readonly jwtService: JwtService,
        @Inject('ACCOUNT_SERVICE_TIENNT') private readonly accountService: AccountService,
    ) { }

    private async generateToken(payload: { email: string }) {
        const token = await this.jwtService.signAsync(payload);
        return token;
    }

    private async decodeToken(token: string) {
        const decodedToken = await this.jwtService.verifyAsync(token);
        return decodedToken;
    }

    async verifyAdminToken(token: string): Promise<boolean> {
        if (!token) {
            throw new HttpException("Token is required", 400);
        }
        const decodedToken = await this.decodeToken(token);
        if (decodedToken.email && decodedToken.exp < Date.now()) {
            var account = await this.accountService.getOneWithEmail(decodedToken.email);
            if (account.email === decodedToken.email && account.role === "admin") {
                return true;
            }
        }
        return false;
    }

    async verifyDstaffToken(token: string): Promise<boolean> {
        if (!token) {
            throw new HttpException("Token is required", 400);
        }
        const decodedToken = await this.decodeToken(token);
        if (decodedToken.email && decodedToken.exp < Date.now()) {
            var account = await this.accountService.getOneWithEmail(decodedToken.email);
            if (account.email === decodedToken.email && (account.role === "dstaff" || account.role === "staff" || account.role === "admin")) {
                return true;
            }
        }
        return false;
    }

    async verifyStaffToken(token: string): Promise<boolean> {
        if (!token) {
            throw new HttpException("Token is required", 400);
        }
        const decodedToken = await this.decodeToken(token);
        if (decodedToken.email && decodedToken.exp < Date.now()) {
            var account = await this.accountService.getOneWithEmail(decodedToken.email);
            console.log('account:', account);
            
            if (account.email === decodedToken.email && (account.role === "staff" || account.role === "admin")) {
                return true;
            }
        }
        return false;
    }

    async verifyToken(token: string): Promise<boolean> {
        if (!token) {
            throw new HttpException("Token is required", 400);
        }
        const decodedToken = await this.decodeToken(token);
        if (decodedToken.email && decodedToken.exp < Date.now()) {
            var account = await this.accountService.getOneWithEmail(decodedToken.email);
            if (account.email === decodedToken.email) {
                return true;
            }
        }
    }

    async verifyFirebaseToken(token: string) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            if (decodedToken.email_verified) {
                var account = await this.accountService.getOneWithEmail(decodedToken.email);
                if (!account) throw new HttpException("Account info is not valid", 400);
                var profile = await this.accountService.getProfile(account.id);
                if (account.email) {
                    return {
                        token: await this.generateToken({ email: account.email }),
                        accountId: account.id,
                        profile,
                    };
                }
            }
        } catch (error) {
            throw new HttpException(error, 400);
        }
    }

    async getEmailFromToken(token: string) {
        const decodedToken = await this.decodeToken(token);
        return decodedToken.email;
    }

    async loginWithPassword(email: string, password: string) {
        var account = await this.accountService.login(email, password);
        if (!account) throw new HttpException("Account info is not valid", 400);
        var profile = await this.accountService.getProfile(account.id);
        return {
            token: await this.generateToken({ email: account.email }),
            accountId: account.id,
            profile,
        };
    }

    // async register(body: { email: string, password: string, name: string }) {
    //     var account = await this.accountService.create(body);
    //     return {
    //         token: await this.generateToken({ email: account.email }),
    //         account,
    //     };
    // }

}