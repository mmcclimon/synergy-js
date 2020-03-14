import UserDirectory from './user-directory';

export default class User {
  directory: UserDirectory;
  username: string;
  lpId?: string;
  isMaster: boolean;
  isVirtual: boolean;
  isDeleted: boolean;
  identities: Record<string, string>;

  constructor({
    directory,
    username,
    lp_id,
    is_master = false,
    is_virtual = false,
    is_deleted = false,
  }) {
    this.directory = directory;
    this.username = username;
    this.lpId = lp_id;
    this.isMaster = is_master;
    this.isVirtual = is_virtual;
    this.isDeleted = is_deleted;
    this.identities = {};
  }

  addIdentity(name: string, val: string): void {
    this.identities[name] = val;
  }
}
