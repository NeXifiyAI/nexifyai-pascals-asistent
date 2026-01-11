/**
 * ============================================================
 * NEXIFY AI - EMAIL IMAP CLIENT
 * IMAP Receiver for Email Inbox
 * ============================================================
 */

import Imap from "imap";
import { simpleParser, ParsedMail } from "mailparser";

// ============================================================
// CONFIG
// ============================================================

export interface IMAPConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  tls: boolean;
  tlsOptions?: {
    rejectUnauthorized: boolean;
  };
}

const defaultConfig: IMAPConfig = {
  host: process.env.IMAP_HOST || "imap.gmail.com",
  port: parseInt(process.env.IMAP_PORT || "993"),
  user: process.env.IMAP_USER || "",
  password: process.env.IMAP_PASS || "",
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false,
  },
};

// ============================================================
// TYPES
// ============================================================

export interface Email {
  id: string;
  messageId: string;
  from: {
    name: string;
    address: string;
  };
  to: Array<{
    name: string;
    address: string;
  }>;
  cc?: Array<{
    name: string;
    address: string;
  }>;
  subject: string;
  date: Date;
  bodyText?: string;
  bodyHtml?: string;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
  isRead: boolean;
  labels?: string[];
}

export interface FetchEmailsOptions {
  folder?: string;
  limit?: number;
  since?: Date;
  unseen?: boolean;
}

// ============================================================
// IMAP CLIENT CLASS
// ============================================================

class IMAPClient {
  private config: IMAPConfig;

  constructor(config?: Partial<IMAPConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Create IMAP connection
   */
  private createConnection(): Imap {
    return new Imap({
      user: this.config.user,
      password: this.config.password,
      host: this.config.host,
      port: this.config.port,
      tls: this.config.tls,
      tlsOptions: this.config.tlsOptions,
    });
  }

  /**
   * Fetch emails from inbox
   */
  async fetchEmails(options: FetchEmailsOptions = {}): Promise<Email[]> {
    const { folder = "INBOX", limit = 50, since, unseen = false } = options;

    return new Promise((resolve, reject) => {
      const imap = this.createConnection();
      const emails: Email[] = [];

      imap.once("ready", () => {
        imap.openBox(folder, true, (err, box) => {
          if (err) {
            imap.end();
            reject(err);
            return;
          }

          // Build search criteria
          const searchCriteria: (string | string[])[] = ["ALL"];
          if (unseen) {
            searchCriteria.length = 0;
            searchCriteria.push("UNSEEN");
          }
          if (since) {
            searchCriteria.push(["SINCE", since.toISOString()]);
          }

          imap.search(searchCriteria, (searchErr, results) => {
            if (searchErr) {
              imap.end();
              reject(searchErr);
              return;
            }

            if (!results || results.length === 0) {
              imap.end();
              resolve([]);
              return;
            }

            // Get latest emails up to limit
            const fetchIds = results.slice(-limit);
            const fetch = imap.fetch(fetchIds, {
              bodies: "",
              struct: true,
              markSeen: false,
            });

            fetch.on("message", (msg, seqno) => {
              msg.on("body", (stream) => {
                simpleParser(stream as NodeJS.ReadableStream)
                  .then((parsed: ParsedMail) => {
                    const email: Email = {
                      id: String(seqno),
                      messageId: parsed.messageId || "",
                      from: {
                        name: parsed.from?.value[0]?.name || "",
                        address: parsed.from?.value[0]?.address || "",
                      },
                      to:
                        parsed.to?.value.map(
                          (t: { name?: string; address?: string }) => ({
                            name: t.name || "",
                            address: t.address || "",
                          }),
                        ) || [],
                      cc: parsed.cc?.value.map(
                        (c: { name?: string; address?: string }) => ({
                          name: c.name || "",
                          address: c.address || "",
                        }),
                      ),
                      subject: parsed.subject || "(No Subject)",
                      date: parsed.date || new Date(),
                      bodyText: parsed.text,
                      bodyHtml: parsed.html || undefined,
                      attachments:
                        parsed.attachments?.map((att) => ({
                          filename: att.filename || "attachment",
                          contentType: att.contentType,
                          size: att.size,
                        })) || [],
                      isRead: false, // Would need FLAGS to determine
                    };
                    emails.push(email);
                  })
                  .catch(console.error);
              });
            });

            fetch.once("error", (fetchErr) => {
              imap.end();
              reject(fetchErr);
            });

            fetch.once("end", () => {
              imap.end();
              // Sort by date descending
              emails.sort((a, b) => b.date.getTime() - a.date.getTime());
              resolve(emails);
            });
          });
        });
      });

      imap.once("error", (err: Error) => {
        reject(err);
      });

      imap.connect();
    });
  }

  /**
   * Get folders list
   */
  async getFolders(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const imap = this.createConnection();

      imap.once("ready", () => {
        imap.getBoxes((err, boxes) => {
          imap.end();
          if (err) {
            reject(err);
            return;
          }

          const folders: string[] = [];
          const extractFolders = (boxObj: Imap.MailBoxes, prefix = "") => {
            for (const [name, box] of Object.entries(boxObj)) {
              const fullName = prefix ? `${prefix}/${name}` : name;
              folders.push(fullName);
              if (box.children) {
                extractFolders(box.children, fullName);
              }
            }
          };
          extractFolders(boxes);
          resolve(folders);
        });
      });

      imap.once("error", (err: Error) => {
        reject(err);
      });

      imap.connect();
    });
  }

  /**
   * Get unread count
   */
  async getUnreadCount(folder = "INBOX"): Promise<number> {
    return new Promise((resolve, reject) => {
      const imap = this.createConnection();

      imap.once("ready", () => {
        imap.openBox(folder, true, (err) => {
          if (err) {
            imap.end();
            reject(err);
            return;
          }

          imap.search(["UNSEEN"], (searchErr, results) => {
            imap.end();
            if (searchErr) {
              reject(searchErr);
              return;
            }
            resolve(results?.length || 0);
          });
        });
      });

      imap.once("error", (err: Error) => {
        reject(err);
      });

      imap.connect();
    });
  }

  /**
   * Mark email as read
   */
  async markAsRead(folder: string, uid: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const imap = this.createConnection();

      imap.once("ready", () => {
        imap.openBox(folder, false, (err) => {
          if (err) {
            imap.end();
            reject(err);
            return;
          }

          imap.addFlags(uid, "\\Seen", (flagErr) => {
            imap.end();
            if (flagErr) {
              reject(flagErr);
              return;
            }
            resolve();
          });
        });
      });

      imap.once("error", (err: Error) => {
        reject(err);
      });

      imap.connect();
    });
  }
}

// ============================================================
// SINGLETON
// ============================================================

let imapClient: IMAPClient | null = null;

export function getIMAPClient(config?: Partial<IMAPConfig>): IMAPClient {
  if (!imapClient) {
    imapClient = new IMAPClient(config);
  }
  return imapClient;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export async function fetchInbox(limit = 50): Promise<Email[]> {
  return getIMAPClient().fetchEmails({ folder: "INBOX", limit });
}

export async function fetchUnreadEmails(limit = 50): Promise<Email[]> {
  return getIMAPClient().fetchEmails({ folder: "INBOX", limit, unseen: true });
}

export async function getUnreadCount(): Promise<number> {
  return getIMAPClient().getUnreadCount();
}

export async function getMailFolders(): Promise<string[]> {
  return getIMAPClient().getFolders();
}

export default IMAPClient;
