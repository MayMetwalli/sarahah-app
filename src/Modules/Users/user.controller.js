import {Router} from "express";
import { SignUpService, SignInService, UpdateAccountService, DeleteAccountService, ListUsersService, ConfirmEmailService, LogOutService, RefreshTokenService, UpdatePasswordService } from "./Services/user.services.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../Middlewares/authorization.middleware.js";
import { RolesEnum } from "../../Common/enums/user.enum.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { SignUpSchema } from "../../Validators/Schemas/user.schema.js";
const router = Router();


router.post('/add', validationMiddleware(SignUpSchema),SignUpService);
router.post('/signin', SignInService);
router.put('/update/:userId', authenticationMiddleware, UpdateAccountService );
router.delete('/delete/:userId', authenticationMiddleware, DeleteAccountService );
router.get('/list', authenticationMiddleware, authorizationMiddleware([RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN]), ListUsersService );
router.put('/confirm', ConfirmEmailService );
router.post('/logout', authenticationMiddleware, LogOutService );
router.post('/refresh-token', RefreshTokenService );
router.patch("/update-password", authenticationMiddleware, UpdatePasswordService)

export default router