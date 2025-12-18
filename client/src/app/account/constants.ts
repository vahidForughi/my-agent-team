import { environment } from '../../environments/environment';

export class Constants {
  public static apiRoot = environment.apiUrl;
  public static clientRoot = environment.clientUrl;
  public static idpAuthority = environment.idpAuthority;
  public static clientId = 'angular-client';
}
