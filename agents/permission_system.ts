// agents/permission_system.ts
// TIER 1: Critical Infrastructure - Access Control
// German Engineering Standards: Hierarchical, Explicit, logged

export enum PermissionLevel {
    GUEST = 0,
    USER = 1,
    OPERATOR = 2,
    ADMIN = 3,
    SUPREME = 5 // The Master AI
}

interface User {
    id: string;
    role: PermissionLevel;
    name: string;
}

export class PermissionSystem {
    private users: Map<string, User> = new Map();

    constructor() {
        // Initialize with default users (Simulated from Database)
        this.users.set('master-ai', { id: 'master-ai', role: PermissionLevel.SUPREME, name: 'NeXify AI Master' });
        this.users.set('pascal', { id: 'pascal', role: PermissionLevel.ADMIN, name: 'Pascal Courbois' });
    }

    /**
     * Verifies if a user has the required permission level
     */
    public checkPermission(userId: string, requiredLevel: PermissionLevel): boolean {
        const user = this.users.get(userId);
        if (!user) {
            console.warn(`[PermissionSystem] Access Denied: User ${userId} not found.`);
            return false;
        }

        if (user.role >= requiredLevel) {
            console.log(`[PermissionSystem] Access Granted: ${user.name} (${user.role}) >= Required (${requiredLevel})`);
            return true;
        } else {
            console.warn(`[PermissionSystem] Access Denied: ${user.name} (${user.role}) < Required (${requiredLevel})`);
            return false;
        }
    }

    public getUserRole(userId: string): PermissionLevel {
        return this.users.get(userId)?.role || PermissionLevel.GUEST;
    }
}

export const permissionSystem = new PermissionSystem();

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log("--- Permission System Agent ---");
    permissionSystem.checkPermission('pascal', PermissionLevel.ADMIN);
    permissionSystem.checkPermission('guest', PermissionLevel.ADMIN);
}
