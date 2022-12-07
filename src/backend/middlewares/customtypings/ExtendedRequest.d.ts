import {LoginCredential} from '../../../common/entities/LoginCredential';
import {UserDTO} from '../../../common/entities/UserDTO';


declare global {
  namespace Express {
    interface Request {

      resultPipe?: any;
      body?: {
        loginCredential?: LoginCredential
      };
      locale?: string;
    }

    interface Response {
      tpl?: any;
    }

    interface Session {
      user?: UserDTO;
      rememberMe?: boolean;
    }
  }
}


