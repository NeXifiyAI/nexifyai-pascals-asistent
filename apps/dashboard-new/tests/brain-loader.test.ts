import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BrainLoader, type Memory } from "../src/lib/brain/supabase-loader";

type QueryResponse<T> = { data: T; error: null };

class StubQuery<T> {
  constructor(private response: QueryResponse<T>) {}
  select() {
    return this;
  }
  or() {
    return this;
  }
  eq() {
    return this;
  }
  order() {
    return Promise.resolve(this.response);
  }
  then<TResult1 = QueryResponse<T>, TResult2 = never>(
    onfulfilled?:
      | ((value: QueryResponse<T>) => TResult1 | PromiseLike<TResult1>)
      | undefined,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined,
  ) {
    return Promise.resolve(this.response).then(onfulfilled, onrejected);
  }
}

class SupabaseStub {
  constructor(private tables: Record<string, QueryResponse<any>>) {}
  from(table: string) {
    return new StubQuery(this.tables[table] ?? { data: [], error: null });
  }
}

test("BrainLoader merges pinned memories with auto-load knowledge", async () => {
  const pinned: Memory[] = [
    {
      id: "mem-1",
      content: "Pinned insight",
      scope: "project",
      type: "knowledge",
      importance: "critical",
      tags: ["core"],
      auto_load: true,
      is_pinned: true,
      created_at: new Date().toISOString(),
    },
  ];

  const knowledge = [{ id: "kb-1", content: "Domain fact", category: "sales" }];

  const supabase = new SupabaseStub({
    memories: { data: pinned, error: null },
    knowledge_base: { data: knowledge, error: null },
  }) as unknown as SupabaseClient;

  const loader = new BrainLoader("project-42", supabase);
  const contexts = await loader.getMandatoryContext();

  assert.equal(contexts.length, 2);
  const kbEntry = contexts.find((memory) => memory.id === "kb-1");
  assert.ok(kbEntry, "knowledge entry converted to memory");
  assert.deepEqual(kbEntry?.tags, ["sales"]);
  assert.equal(kbEntry?.importance, "high");
});
