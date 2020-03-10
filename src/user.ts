import UserDirectory from './user-directory';

export default class User {
  directory: UserDirectory;
  username: string;
  lpId?: string;
  isMaster: boolean;
  isVirtual: boolean;
  isDeleted: boolean;
  identities: Record<string, string>;

  constructor(arg) {
    this.directory = arg.directory;
    this.username = arg.username;
    this.lpId = arg.lp_id;
    this.isMaster = arg.is_master || false;
    this.isVirtual = arg.is_virtual || false;
    this.isDeleted = arg.is_deleted || false;
    this.identities = {};
  }

  addIdentity(name: string, val: string): void {
    this.identities[name] = val;
  }
}
