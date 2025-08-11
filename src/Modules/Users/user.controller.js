import {Router} from "express";
import { SignUpService, SignInService, UpdateAccountService, DeleteAccountService, ListUsersService, ConfirmEmailService, LogOutService, RefreshTokenService, UpdatePasswordService } from "./Services/user.services.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middleware.js";
const router = Router();

router.post('/add',SignUpService);
router.post('/signin', SignInService);
router.put('/update/:userId', authenticationMiddleware, UpdateAccountService );
router.delete('/delete/:userId', authenticationMiddleware, DeleteAccountService );
router.get('/list', ListUsersService );
router.put('/confirm', ConfirmEmailService );
router.post('/logout', authenticationMiddleware, LogOutService );
router.post('/refresh-token', RefreshTokenService );
router.patch("/update-password", authenticationMiddleware, UpdatePasswordService)

export default router