// agents/system_health_check.ts
// TIER 3: Operations & Observability - Health Checks
// German Engineering Standards: Proactive, Comprehensive

import fs from 'fs';
import path from 'path';

interface HealthStatus {
    status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    checks: {
        env: boolean;
        node_modules: boolean;
        agents_dir: boolean;
    };
    timestamp: string;
}

export class SystemHealthCheck {
    private rootDir: string;

    constructor() {
        this.rootDir = path.resolve(__dirname, '..');
    }

    public async run(): Promise<HealthStatus> {
        console.log("[HealthCheck] Running diagnostics...");
        
        const checks = {
            env: fs.existsSync(path.join(this.rootDir, '.env')),
            node_modules: fs.existsSync(path.join(this.rootDir, 'node_modules')),
            agents_dir: fs.existsSync(path.join(this.rootDir, 'agents'))
        };

        const allPassed = Object.values(checks).every(Boolean);
        const status = allPassed ? 'HEALTHY' : 'CRITICAL';

        const report: HealthStatus = {
            status,
            checks,
            timestamp: new Date().toISOString()
        };

        console.log(`[HealthCheck] Status: ${status}`, report);
        return report;
    }
}

export const healthCheck = new SystemHealthCheck();

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
        await healthCheck.run();
    })();
}
